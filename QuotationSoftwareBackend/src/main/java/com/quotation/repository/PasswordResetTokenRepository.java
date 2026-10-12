package com.quotation.repository;

import com.quotation.model.PasswordResetToken;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends MongoRepository<PasswordResetToken, String> {
    Optional<PasswordResetToken> findByToken(String token);
    List<PasswordResetToken> findByEmployeeEmail(String employeeEmail);
    List<PasswordResetToken> findByEmployeeEmailAndUsedFalse(String employeeEmail);
    List<PasswordResetToken> findByEmployeeIdAndUsedTrueOrderByUsedAtDesc(String employeeId);
}
