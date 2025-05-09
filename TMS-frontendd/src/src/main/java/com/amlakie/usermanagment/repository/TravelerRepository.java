package com.amlakie.usermanagment.repository;

import com.amlakie.usermanagment.entity.Traveler;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TravelerRepository extends JpaRepository<Traveler, Long> {
}
