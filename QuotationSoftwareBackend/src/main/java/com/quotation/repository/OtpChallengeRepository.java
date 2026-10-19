package com.quotation.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.quotation.model.OtpChallenge;

public interface OtpChallengeRepository extends MongoRepository<OtpChallenge, String> {

    Optional<OtpChallenge> findByChallengeIdHash(String challengeIdHash);
}
