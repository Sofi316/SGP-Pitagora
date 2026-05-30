package com.pitagora.backend.SGP_Pitagora.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import com.pitagora.backend.SGP_Pitagora.model.Solicitud;

@Service
public class ReporteService {

    public byte[] exportarSolicitudesAExcel(List<Solicitud> solicitudes) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);

            CellStyle dataStyle = workbook.createCellStyle();
            dataStyle.setBorderTop(BorderStyle.THIN);
            dataStyle.setBorderBottom(BorderStyle.THIN);
            dataStyle.setBorderLeft(BorderStyle.THIN);
            dataStyle.setBorderRight(BorderStyle.THIN);

            CellStyle subHeaderStyle = workbook.createCellStyle();
            Font subHeaderFont = workbook.createFont();
            subHeaderFont.setBold(true);
            subHeaderStyle.setFont(subHeaderFont);
            subHeaderStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            subHeaderStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            subHeaderStyle.setBorderTop(BorderStyle.THIN);
            subHeaderStyle.setBorderBottom(BorderStyle.THIN);
            subHeaderStyle.setBorderLeft(BorderStyle.THIN);
            subHeaderStyle.setBorderRight(BorderStyle.THIN);

            long total = solicitudes.size();
            long pendientes = 0;
            long enProceso = 0;
            long terminados = 0;
            long aprobados = 0;
            long rechazados = 0;
            long noAplica = 0;

            for (Solicitud s : solicitudes) {
                if (s.getEstadoSolicitud() != null && s.getEstadoSolicitud().getNombre() != null) {
                    String estadoNormalizado = s.getEstadoSolicitud().getNombre().trim().toUpperCase().replace(" ", "_");
                    switch (estadoNormalizado) {
                        case "PENDIENTE": 
                            pendientes++; 
                            break;
                        case "EN_PROCESO": 
                            enProceso++; 
                            break;
                        case "TERMINADO": 
                            terminados++; 
                            break;
                        case "APROBADO": 
                            aprobados++; 
                            break;
                        case "RECHAZADO": 
                            rechazados++; 
                            break;
                        case "NO_APLICA": 
                            noAplica++; 
                            break;
                    }
                }
            }

            Sheet sheetEstados = workbook.createSheet("Resumen Estados");
            Row estHeaderRow = sheetEstados.createRow(0);
            String[] estHeaders = {"Métrica de Estado", "Cantidad", "Porcentaje"};
            for (int i = 0; i < estHeaders.length; i++) {
                Cell cell = estHeaderRow.createCell(i);
                cell.setCellValue(estHeaders[i]);
                cell.setCellStyle(headerStyle);
            }

            String[][] summaryData = {
                {"Total Solicitudes en el periodo", String.valueOf(total), "100.0%"},
                {"Pendientes", String.valueOf(pendientes), calcularPorcentaje(pendientes, total)},
                {"Postventa Ejecutada (En Proceso)", String.valueOf(enProceso), calcularPorcentaje(enProceso, total)},
                {"Terminados", String.valueOf(terminados), calcularPorcentaje(terminados, total)},
                {"Recepcionados por Clientes (Aprobados)", String.valueOf(aprobados), calcularPorcentaje(aprobados, total)},
                {"Rechazados", String.valueOf(rechazados), calcularPorcentaje(rechazados, total)},
                {"No Aplica", String.valueOf(noAplica), calcularPorcentaje(noAplica, total)}
            };

            int rowNum = 1;
            for (String[] rowData : summaryData) {
                Row row = sheetEstados.createRow(rowNum++);
                Cell c0 = row.createCell(0); c0.setCellValue(rowData[0]); c0.setCellStyle(dataStyle);
                Cell c1 = row.createCell(1); c1.setCellValue(Integer.parseInt(rowData[1])); c1.setCellStyle(dataStyle);
                Cell c2 = row.createCell(2); c2.setCellValue(rowData[2]); c2.setCellStyle(dataStyle);
            }
            for (int i = 0; i < 3; i++) sheetEstados.autoSizeColumn(i);

            Sheet sheetCat = workbook.createSheet("Resumen Categorías");
            Row catHeaderRow = sheetCat.createRow(0);
            String[] catHeaders = {"Categoría", "Subcategoría", "Cantidad", "Porcentaje"};
            for (int i = 0; i < catHeaders.length; i++) {
                Cell cell = catHeaderRow.createCell(i);
                cell.setCellValue(catHeaders[i]);
                cell.setCellStyle(headerStyle);
            }

            Map<String, Map<String, Long>> catSubCatCount = solicitudes.stream()
                .collect(Collectors.groupingBy(
                    s -> (s.getSubCategoria() != null && s.getSubCategoria().getCategoria() != null && s.getSubCategoria().getCategoria().getNombre() != null) 
                         ? s.getSubCategoria().getCategoria().getNombre() 
                         : "Sin Categoría",
                    Collectors.groupingBy(
                        s -> (s.getSubCategoria() != null && s.getSubCategoria().getNombre() != null)
                             ? s.getSubCategoria().getNombre()
                             : "Sin Subcategoría",
                        Collectors.counting()
                    )
                ));

            int rowNumCat = 1;
            for (Map.Entry<String, Map<String, Long>> catEntry : catSubCatCount.entrySet()) {
                String categoria = catEntry.getKey();
                Map<String, Long> subCats = catEntry.getValue();
                long totalCategoria = subCats.values().stream().mapToLong(Long::longValue).sum();
                
                Row catRow = sheetCat.createRow(rowNumCat++);
                Cell cellCat0 = catRow.createCell(0); cellCat0.setCellValue(categoria); cellCat0.setCellStyle(subHeaderStyle);
                Cell cellCat1 = catRow.createCell(1); cellCat1.setCellValue("TOTAL CATEGORÍA"); cellCat1.setCellStyle(subHeaderStyle);
                Cell cellCat2 = catRow.createCell(2); cellCat2.setCellValue(totalCategoria); cellCat2.setCellStyle(subHeaderStyle);
                Cell cellCat3 = catRow.createCell(3); cellCat3.setCellValue(calcularPorcentaje(totalCategoria, total)); cellCat3.setCellStyle(subHeaderStyle);

                for (Map.Entry<String, Long> subCatEntry : subCats.entrySet()) {
                    Row subCatRow = sheetCat.createRow(rowNumCat++);
                    Cell sc0 = subCatRow.createCell(0); sc0.setCellValue(""); sc0.setCellStyle(dataStyle);
                    Cell sc1 = subCatRow.createCell(1); sc1.setCellValue(subCatEntry.getKey()); sc1.setCellStyle(dataStyle);
                    Cell sc2 = subCatRow.createCell(2); sc2.setCellValue(subCatEntry.getValue().intValue()); sc2.setCellStyle(dataStyle);
                    Cell sc3 = subCatRow.createCell(3); sc3.setCellValue(calcularPorcentaje(subCatEntry.getValue(), total)); sc3.setCellStyle(dataStyle);
                }
            }
            for (int i = 0; i < 4; i++) sheetCat.autoSizeColumn(i);

            Sheet sheetDetalle = workbook.createSheet("Detalle Solicitudes");
            Row detHeaderRow = sheetDetalle.createRow(0);
            String[] headers = {"ID", "Fecha Ingreso", "Empresa Contratista", "Obra", "Estado", "Categoría", "Subcategoría", "Descripción"};
            for (int col = 0; col < headers.length; col++) {
                Cell cell = detHeaderRow.createCell(col);
                cell.setCellValue(headers[col]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            for (Solicitud solicitud : solicitudes) {
                Row row = sheetDetalle.createRow(rowIdx++);

                Cell c0 = row.createCell(0); c0.setCellValue(solicitud.getId()); c0.setCellStyle(dataStyle);
                
                String fecha = solicitud.getFechaIngreso() != null ? solicitud.getFechaIngreso().toString().split("T")[0] : "N/A";
                Cell c1 = row.createCell(1); c1.setCellValue(fecha); c1.setCellStyle(dataStyle);

                String empresa = (solicitud.getObra() != null && solicitud.getObra().getEmpresaCliente() != null)
                                 ? solicitud.getObra().getEmpresaCliente().getRazonSocial() : "N/A";
                Cell c2 = row.createCell(2); c2.setCellValue(empresa); c2.setCellStyle(dataStyle);

                String obra = solicitud.getObra() != null ? solicitud.getObra().getNombre() : "N/A";
                Cell c3 = row.createCell(3); c3.setCellValue(obra); c3.setCellStyle(dataStyle);
                
                String estado = solicitud.getEstadoSolicitud() != null ? solicitud.getEstadoSolicitud().getNombre() : "N/A";
                Cell c4 = row.createCell(4); c4.setCellValue(estado); c4.setCellStyle(dataStyle);

                String categoria = (solicitud.getSubCategoria() != null && solicitud.getSubCategoria().getCategoria() != null)
                                   ? solicitud.getSubCategoria().getCategoria().getNombre() : "N/A";
                Cell c5 = row.createCell(5); c5.setCellValue(categoria); c5.setCellStyle(dataStyle);

                String subCategoria = solicitud.getSubCategoria() != null ? solicitud.getSubCategoria().getNombre() : "N/A";
                Cell c6 = row.createCell(6); c6.setCellValue(subCategoria); c6.setCellStyle(dataStyle);
                
                String desc = solicitud.getDescripcion() != null ? solicitud.getDescripcion() : "N/A";
                Cell c7 = row.createCell(7); c7.setCellValue(desc); c7.setCellStyle(dataStyle);
            }
            for (int i = 0; i < headers.length; i++) sheetDetalle.autoSizeColumn(i);

            workbook.write(out);
            return out.toByteArray();
        }
    }

    private String calcularPorcentaje(long cantidad, long total) {
        if (total == 0) return "0.0%";
        return String.format(Locale.US, "%.1f%%", (cantidad * 100.0) / total);
    }
}