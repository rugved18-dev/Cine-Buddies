package com.cinebuddies.repository;

import com.cinebuddies.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, String> {
    Optional<Room> findByCode(String code);
}

