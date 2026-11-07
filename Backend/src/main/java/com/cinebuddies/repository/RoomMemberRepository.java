package com.cinebuddies.repository;

import com.cinebuddies.model.RoomMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RoomMemberRepository extends JpaRepository<RoomMember, UUID> {

    @Query("SELECT COUNT(m) > 0 FROM RoomMember m WHERE m.room.code = :roomCode AND m.displayName = :displayName")
    boolean existsByRoomCodeAndDisplayName(@Param("roomCode") String roomCode, @Param("displayName") String displayName);

    List<RoomMember> findByRoom_Code(String roomCode);
}

