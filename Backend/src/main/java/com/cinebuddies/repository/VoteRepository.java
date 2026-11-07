package com.cinebuddies.repository;

import com.cinebuddies.model.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VoteRepository extends JpaRepository<Vote, UUID> {

    @Query("SELECT v FROM Vote v WHERE UPPER(v.room.code) = UPPER(:roomCode) AND v.movie.id = :movieId AND v.roomMember.id = :roomMemberId")
    Optional<Vote> findByRoomCodeAndMovieIdAndRoomMemberId(
            @Param("roomCode") String roomCode,
            @Param("movieId") String movieId,
            @Param("roomMemberId") UUID roomMemberId
    );

    @Query("SELECT v FROM Vote v WHERE UPPER(v.room.code) = UPPER(:roomCode)")
    List<Vote> findByRoomCode(@Param("roomCode") String roomCode);
}

