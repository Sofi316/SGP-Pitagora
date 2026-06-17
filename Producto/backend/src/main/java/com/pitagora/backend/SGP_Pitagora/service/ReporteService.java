package com.pitagora.backend.SGP_Pitagora.service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import com.pitagora.backend.SGP_Pitagora.model.Solicitud;

@Service
public class ReporteService {

    public byte[] exportarSolicitudesAExcel(List<Solicitud> solicitudes) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            CellStyle headerStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
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
            org.apache.poi.ss.usermodel.Font subHeaderFont = workbook.createFont();
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

            // 1. Hoja de Estados
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

            // 2. Hoja de Categorías
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

            // 3. NUEVA HOJA: Costos por Obra
            Sheet sheetCostos = workbook.createSheet("Costos por Obra");
            Row costoHeaderRow = sheetCostos.createRow(0);
            String[] costoHeaders = {"Nombre de la Obra", "Costo Total de Reparación ($)"};
            for (int i = 0; i < costoHeaders.length; i++) {
                Cell cell = costoHeaderRow.createCell(i);
                cell.setCellValue(costoHeaders[i]);
                cell.setCellStyle(headerStyle);
            }

            Map<String, Long> costosPorObra = solicitudes.stream()
                .collect(Collectors.groupingBy(
                    s -> (s.getObra() != null && s.getObra().getNombre() != null) ? s.getObra().getNombre() : "Sin Obra Asignada",
                    Collectors.summingLong(s -> s.getCostoReparacion() != null ? s.getCostoReparacion() : 0L)
                ));
                
            int rowNumCosto = 1;
            long costoTotalAcumulado = 0;
            for (Map.Entry<String, Long> entry : costosPorObra.entrySet()) {
                Row row = sheetCostos.createRow(rowNumCosto++);
                Cell c0 = row.createCell(0); c0.setCellValue(entry.getKey()); c0.setCellStyle(dataStyle);
                Cell c1 = row.createCell(1); c1.setCellValue(entry.getValue()); c1.setCellStyle(dataStyle);
                costoTotalAcumulado += entry.getValue();
            }
            
            Row totalCostoRow = sheetCostos.createRow(rowNumCosto);
            Cell t0 = totalCostoRow.createCell(0); t0.setCellValue("TOTAL GENERAL ($)"); t0.setCellStyle(subHeaderStyle);
            Cell t1 = totalCostoRow.createCell(1); t1.setCellValue(costoTotalAcumulado); t1.setCellStyle(subHeaderStyle);
            
            for (int i = 0; i < 2; i++) sheetCostos.autoSizeColumn(i);

            // 4. Hoja Detalle Solicitudes (Añadido el campo Costo Reparación)
            Sheet sheetDetalle = workbook.createSheet("Detalle Solicitudes");
            Row detHeaderRow = sheetDetalle.createRow(0);
            String[] headers = {"ID", "Fecha Ingreso", "Empresa Contratista", "Obra", "Estado", "Categoría", "Subcategoría", "Descripción", "Costo ($)"};
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

                Long costo = solicitud.getCostoReparacion() != null ? solicitud.getCostoReparacion() : 0L;
                Cell c8 = row.createCell(8); c8.setCellValue(costo); c8.setCellStyle(dataStyle);
            }
            for (int i = 0; i < headers.length; i++) sheetDetalle.autoSizeColumn(i);

            workbook.write(out);
            return out.toByteArray();
        }
    }

    public byte[] exportarSolicitudesAPdf(List<Solicitud> solicitudes) throws IOException {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4.rotate(), 36, 36, 50, 50);
            PdfWriter.getInstance(document, out);
            document.open();

            com.lowagie.text.Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, Color.BLACK);
            com.lowagie.text.Font fontSubtitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, Color.BLACK);
            com.lowagie.text.Font fontHeader = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);
            com.lowagie.text.Font fontData = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.BLACK);
            com.lowagie.text.Font fontSubHeader = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.BLACK);
            com.lowagie.text.Font fontMeta = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10, Color.DARK_GRAY);
            
            Color bgHeader = new Color(0, 0, 139);
            Color bgSubHeader = new Color(220, 220, 220);

            Paragraph title = new Paragraph("Reporte Integral de Solicitudes", fontTitle);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(5);
            document.add(title);

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
            Paragraph metadata = new Paragraph("Generado el: " + LocalDateTime.now().format(formatter), fontMeta);
            metadata.setAlignment(Element.ALIGN_CENTER);
            metadata.setSpacingAfter(25);
            document.add(metadata);

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
                        case "PENDIENTE": pendientes++; break;
                        case "EN_PROCESO": enProceso++; break;
                        case "TERMINADO": terminados++; break;
                        case "APROBADO": aprobados++; break;
                        case "RECHAZADO": rechazados++; break;
                        case "NO_APLICA": noAplica++; break;
                    }
                }
            }

            // 1. Estados
            Paragraph subtitle1 = new Paragraph("1. Resumen General por Estados", fontSubtitle);
            subtitle1.setSpacingAfter(10);
            document.add(subtitle1);

            PdfPTable tableEst = new PdfPTable(3);
            tableEst.setWidthPercentage(70f);
            tableEst.setHorizontalAlignment(Element.ALIGN_LEFT);
            tableEst.setSpacingAfter(20);

            String[] estHeaders = {"Métrica de Estado", "Cantidad", "Porcentaje"};
            for (String h : estHeaders) {
                PdfPCell cell = new PdfPCell(new Phrase(h, fontHeader));
                cell.setBackgroundColor(bgHeader);
                cell.setPadding(6);
                tableEst.addCell(cell);
            }

            String[][] summaryData = {
                {"Total Solicitudes Procesadas", String.valueOf(total), "100.0%"},
                {"Pendientes", String.valueOf(pendientes), calcularPorcentaje(pendientes, total)},
                {"Postventa Ejecutada (En Proceso)", String.valueOf(enProceso), calcularPorcentaje(enProceso, total)},
                {"Terminados", String.valueOf(terminados), calcularPorcentaje(terminados, total)},
                {"Recepcionados por Clientes (Aprobados)", String.valueOf(aprobados), calcularPorcentaje(aprobados, total)},
                {"Rechazados", String.valueOf(rechazados), calcularPorcentaje(rechazados, total)},
                {"No Aplica", String.valueOf(noAplica), calcularPorcentaje(noAplica, total)}
            };

            for (String[] rowData : summaryData) {
                for (String text : rowData) {
                    PdfPCell cell = new PdfPCell(new Phrase(text, fontData));
                    cell.setPadding(5);
                    tableEst.addCell(cell);
                }
            }
            document.add(tableEst);

            // 2. Obras
            Paragraph subtitleObra = new Paragraph("2. Resumen de Volumen por Obra", fontSubtitle);
            subtitleObra.setSpacingAfter(10);
            document.add(subtitleObra);

            PdfPTable tableObra = new PdfPTable(3);
            tableObra.setWidthPercentage(70f);
            tableObra.setHorizontalAlignment(Element.ALIGN_LEFT);
            tableObra.setSpacingAfter(20);

            String[] obraHeaders = {"Nombre de la Obra", "Cantidad de Solicitudes", "Porcentaje del Total"};
            for (String h : obraHeaders) {
                PdfPCell cell = new PdfPCell(new Phrase(h, fontHeader));
                cell.setBackgroundColor(bgHeader);
                cell.setPadding(6);
                tableObra.addCell(cell);
            }

            Map<String, Long> countByObra = solicitudes.stream()
                .collect(Collectors.groupingBy(
                    s -> (s.getObra() != null && s.getObra().getNombre() != null) ? s.getObra().getNombre() : "Sin Obra Asignada",
                    Collectors.counting()
                ));

            for (Map.Entry<String, Long> entry : countByObra.entrySet()) {
                PdfPCell c1 = new PdfPCell(new Phrase(entry.getKey(), fontData));
                c1.setPadding(5); tableObra.addCell(c1);
                
                PdfPCell c2 = new PdfPCell(new Phrase(String.valueOf(entry.getValue()), fontData));
                c2.setPadding(5); tableObra.addCell(c2);
                
                PdfPCell c3 = new PdfPCell(new Phrase(calcularPorcentaje(entry.getValue(), total), fontData));
                c3.setPadding(5); tableObra.addCell(c3);
            }
            document.add(tableObra);

            // 3. NUEVO: Costos por Obra
            Paragraph subtitleCostos = new Paragraph("3. Resumen de Costos Financieros por Obra", fontSubtitle);
            subtitleCostos.setSpacingAfter(10);
            document.add(subtitleCostos);

            PdfPTable tableCostos = new PdfPTable(2);
            tableCostos.setWidthPercentage(70f);
            tableCostos.setHorizontalAlignment(Element.ALIGN_LEFT);
            tableCostos.setSpacingAfter(20);

            String[] costoHeadersTable = {"Nombre de la Obra", "Costo Total de Reparación ($)"};
            for (String h : costoHeadersTable) {
                PdfPCell cell = new PdfPCell(new Phrase(h, fontHeader));
                cell.setBackgroundColor(bgHeader);
                cell.setPadding(6);
                tableCostos.addCell(cell);
            }

            Map<String, Long> costosPorObra = solicitudes.stream()
                .collect(Collectors.groupingBy(
                    s -> (s.getObra() != null && s.getObra().getNombre() != null) ? s.getObra().getNombre() : "Sin Obra Asignada",
                    Collectors.summingLong(s -> s.getCostoReparacion() != null ? s.getCostoReparacion() : 0L)
                ));

            long costoTotalAcumulado = 0;
            for (Map.Entry<String, Long> entry : costosPorObra.entrySet()) {
                PdfPCell c1 = new PdfPCell(new Phrase(entry.getKey(), fontData));
                c1.setPadding(5); tableCostos.addCell(c1);
                
                PdfPCell c2 = new PdfPCell(new Phrase(String.format(Locale.forLanguageTag("es-CL"), "$ %,d", entry.getValue()), fontData));
                c2.setPadding(5); tableCostos.addCell(c2);
                
                costoTotalAcumulado += entry.getValue();
            }
            
            PdfPCell totalTextCell = new PdfPCell(new Phrase("TOTAL GENERAL INVERTIDO", fontSubHeader));
            totalTextCell.setBackgroundColor(bgSubHeader); 
            totalTextCell.setPadding(5); 
            tableCostos.addCell(totalTextCell);
            
            PdfPCell totalNumCell = new PdfPCell(new Phrase(String.format(Locale.forLanguageTag("es-CL"), "$ %,d", costoTotalAcumulado), fontSubHeader));
            totalNumCell.setBackgroundColor(bgSubHeader); 
            totalNumCell.setPadding(5); 
            tableCostos.addCell(totalNumCell);

            document.add(tableCostos);

            // 4. Categorías
            Paragraph subtitle4 = new Paragraph("4. Desglose Estructural por Categorías", fontSubtitle);
            subtitle4.setSpacingAfter(10);
            document.add(subtitle4);

            PdfPTable tableCat = new PdfPTable(4);
            tableCat.setWidthPercentage(90f);
            tableCat.setHorizontalAlignment(Element.ALIGN_LEFT);
            tableCat.setWidths(new float[]{3f, 3f, 1f, 1.5f});
            tableCat.setSpacingAfter(30);

            String[] catHeaders = {"Categoría Principal", "Subcategoría", "Cantidad", "Porcentaje"};
            for (String h : catHeaders) {
                PdfPCell cell = new PdfPCell(new Phrase(h, fontHeader));
                cell.setBackgroundColor(bgHeader);
                cell.setPadding(6);
                tableCat.addCell(cell);
            }

            Map<String, Map<String, Long>> catSubCatCount = solicitudes.stream()
                .collect(Collectors.groupingBy(
                    s -> (s.getSubCategoria() != null && s.getSubCategoria().getCategoria() != null && s.getSubCategoria().getCategoria().getNombre() != null) 
                         ? s.getSubCategoria().getCategoria().getNombre() : "Sin Categoría",
                    Collectors.groupingBy(
                        s -> (s.getSubCategoria() != null && s.getSubCategoria().getNombre() != null)
                             ? s.getSubCategoria().getNombre() : "Sin Subcategoría",
                        Collectors.counting()
                    )
                ));

            for (Map.Entry<String, Map<String, Long>> catEntry : catSubCatCount.entrySet()) {
                String categoria = catEntry.getKey();
                Map<String, Long> subCats = catEntry.getValue();
                long totalCategoria = subCats.values().stream().mapToLong(Long::longValue).sum();

                PdfPCell c1 = new PdfPCell(new Phrase(categoria, fontSubHeader));
                c1.setBackgroundColor(bgSubHeader); c1.setPadding(5); tableCat.addCell(c1);
                
                PdfPCell c2 = new PdfPCell(new Phrase("TOTAL CATEGORÍA", fontSubHeader));
                c2.setBackgroundColor(bgSubHeader); c2.setPadding(5); tableCat.addCell(c2);
                
                PdfPCell c3 = new PdfPCell(new Phrase(String.valueOf(totalCategoria), fontSubHeader));
                c3.setBackgroundColor(bgSubHeader); c3.setPadding(5); tableCat.addCell(c3);
                
                PdfPCell c4 = new PdfPCell(new Phrase(calcularPorcentaje(totalCategoria, total), fontSubHeader));
                c4.setBackgroundColor(bgSubHeader); c4.setPadding(5); tableCat.addCell(c4);

                for (Map.Entry<String, Long> subCatEntry : subCats.entrySet()) {
                    PdfPCell sc1 = new PdfPCell(new Phrase("", fontData));
                    sc1.setPadding(5); tableCat.addCell(sc1);
                    
                    PdfPCell sc2 = new PdfPCell(new Phrase(subCatEntry.getKey(), fontData));
                    sc2.setPadding(5); tableCat.addCell(sc2);
                    
                    PdfPCell sc3 = new PdfPCell(new Phrase(String.valueOf(subCatEntry.getValue()), fontData));
                    sc3.setPadding(5); tableCat.addCell(sc3);
                    
                    PdfPCell sc4 = new PdfPCell(new Phrase(calcularPorcentaje(subCatEntry.getValue(), total), fontData));
                    sc4.setPadding(5); tableCat.addCell(sc4);
                }
            }
            document.add(tableCat);

            document.newPage();

            // 5. Registro Detallado (Añadida la columna Costo)
            Paragraph subtitle5 = new Paragraph("5. Registro Detallado de Solicitudes", fontSubtitle);
            subtitle5.setSpacingAfter(10);
            document.add(subtitle5);

            PdfPTable tableDet = new PdfPTable(9); // Modificado a 9 columnas
            tableDet.setWidthPercentage(100f);
            tableDet.setWidths(new float[]{1f, 2f, 3f, 3f, 2f, 2.5f, 2.5f, 4f, 2f});

            String[] detHeaders = {"ID", "Fecha Ingreso", "Empresa", "Obra", "Estado", "Categoría", "Subcategoría", "Descripción", "Costo ($)"};
            for (String h : detHeaders) {
                PdfPCell cell = new PdfPCell(new Phrase(h, fontHeader));
                cell.setBackgroundColor(bgHeader);
                cell.setPadding(6);
                tableDet.addCell(cell);
            }

            for (Solicitud solicitud : solicitudes) {
                PdfPCell idCell = new PdfPCell(new Phrase(String.valueOf(solicitud.getId()), fontData));
                idCell.setPadding(5); tableDet.addCell(idCell);
                
                String fecha = solicitud.getFechaIngreso() != null ? solicitud.getFechaIngreso().toString().split("T")[0] : "N/A";
                PdfPCell fechaCell = new PdfPCell(new Phrase(fecha, fontData));
                fechaCell.setPadding(5); tableDet.addCell(fechaCell);
                
                String empresa = (solicitud.getObra() != null && solicitud.getObra().getEmpresaCliente() != null)
                                 ? solicitud.getObra().getEmpresaCliente().getRazonSocial() : "N/A";
                PdfPCell empCell = new PdfPCell(new Phrase(empresa, fontData));
                empCell.setPadding(5); tableDet.addCell(empCell);
                
                String obra = solicitud.getObra() != null ? solicitud.getObra().getNombre() : "N/A";
                PdfPCell obraCell = new PdfPCell(new Phrase(obra, fontData));
                obraCell.setPadding(5); tableDet.addCell(obraCell);
                
                String estado = solicitud.getEstadoSolicitud() != null ? solicitud.getEstadoSolicitud().getNombre() : "N/A";
                PdfPCell estCell = new PdfPCell(new Phrase(estado, fontData));
                estCell.setPadding(5); tableDet.addCell(estCell);
                
                String categoria = (solicitud.getSubCategoria() != null && solicitud.getSubCategoria().getCategoria() != null)
                                   ? solicitud.getSubCategoria().getCategoria().getNombre() : "N/A";
                PdfPCell catCell = new PdfPCell(new Phrase(categoria, fontData));
                catCell.setPadding(5); tableDet.addCell(catCell);
                
                String subCategoria = solicitud.getSubCategoria() != null ? solicitud.getSubCategoria().getNombre() : "N/A";
                PdfPCell subCatCell = new PdfPCell(new Phrase(subCategoria, fontData));
                subCatCell.setPadding(5); tableDet.addCell(subCatCell);
                
                String desc = solicitud.getDescripcion() != null ? solicitud.getDescripcion() : "N/A";
                PdfPCell descCell = new PdfPCell(new Phrase(desc, fontData));
                descCell.setPadding(5); tableDet.addCell(descCell);

                Long costoNum = solicitud.getCostoReparacion() != null ? solicitud.getCostoReparacion() : 0L;
                PdfPCell costoCell = new PdfPCell(new Phrase(String.format(Locale.forLanguageTag("es-CL"), "$ %,d", costoNum), fontData));
                costoCell.setPadding(5); tableDet.addCell(costoCell);
            }
            document.add(tableDet);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new IOException(e.getMessage());
        }
    }

    private String calcularPorcentaje(long cantidad, long total) {
        if (total == 0) return "0.0%";
        return String.format(Locale.US, "%.1f%%", (cantidad * 100.0) / total);
    }
}