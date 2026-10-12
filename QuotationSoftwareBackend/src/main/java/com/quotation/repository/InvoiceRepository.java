package com.quotation.repository;

import com.quotation.model.Invoice;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface InvoiceRepository extends MongoRepository<Invoice, String> {
    List<Invoice> findByEmployeeId(String employeeId);
    List<Invoice> findByQuotationId(String quotationId);
}