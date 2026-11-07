package com.cinebuddies.repository;

import com.cinebuddies.model.MemberPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MemberPreferenceRepository extends JpaRepository<MemberPreference, UUID> {

    Optional<MemberPreference> findByRoomMemberId(UUID roomMemberId);

    @Query("SELECT mp FROM MemberPreference mp WHERE UPPER(mp.roomMember.room.code) = UPPER(:roomCode)")
    List<MemberPreference> findAllByRoomCode(@Param("roomCode") String roomCode);
}
