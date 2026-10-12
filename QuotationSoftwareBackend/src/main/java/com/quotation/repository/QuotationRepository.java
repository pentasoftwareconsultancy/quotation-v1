package com.quotation.repository;

import com.quotation.model.Quotation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuotationRepository extends MongoRepository<Quotation, String> {
    
	// This will now look for the unique Employee ID stored in the preparedBy field
    List<Quotation> findByPreparedBy(String empId);
    
 // Add this to find quotations that need to be checked for reminders
    List<Quotation> findByStatus(String status);

    @Query(value = "{}", fields = "{ 'projectManagerSignature': 0, 'operationManagerSignature': 0, 'costBreakdown': 0, 'timeline': 0, 'terms': 0 }")
    List<Quotation> findAllExcludingHeavyFields();
    
    Quotation findByApprovalToken(String approvalToken);
}