package no.naboplan.merknad;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MerknadRepository extends JpaRepository<Merknad, UUID> {
    List<Merknad> findByPlanIdOrderByCreatedAtDesc(String planId);
    long countByPlanId(String planId);
}
