package com.cinebuddies.service;

import com.cinebuddies.dto.voting.FinalizeRequest;
import com.cinebuddies.dto.voting.VoteRequest;
import com.cinebuddies.dto.voting.VoteResponse;
import com.cinebuddies.model.Movie;
import com.cinebuddies.model.Room;
import com.cinebuddies.model.RoomMember;
import com.cinebuddies.model.Vote;
import com.cinebuddies.repository.MovieRepository;
import com.cinebuddies.repository.RoomMemberRepository;
import com.cinebuddies.repository.RoomRepository;
import com.cinebuddies.repository.VoteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class VotingService {

    private final VoteRepository voteRepository;
    private final MovieRepository movieRepository;
    private final RoomRepository roomRepository;
    private final RoomMemberRepository roomMemberRepository;

    public VotingService(
            VoteRepository voteRepository,
            MovieRepository movieRepository,
            RoomRepository roomRepository,
            RoomMemberRepository roomMemberRepository
    ) {
        this.voteRepository = voteRepository;
        this.movieRepository = movieRepository;
        this.roomRepository = roomRepository;
        this.roomMemberRepository = roomMemberRepository;
    }

    public VoteResponse castVote(String roomCode, UUID memberId, VoteRequest request) {
        if (roomCode == null || roomCode.trim().isEmpty()) {
            throw new IllegalArgumentException("Room code must not be empty.");
        }
        if (memberId == null) {
            throw new IllegalArgumentException("Member ID must not be null.");
        }
        if (request == null || request.movieId() == null || request.movieId().trim().isEmpty()) {
            throw new IllegalArgumentException("Vote request and Movie ID must not be empty.");
        }
        if (request.choice() == null) {
            throw new IllegalArgumentException("Vote choice must not be null.");
        }

        String normalizedCode = roomCode.trim().toUpperCase();

        // 1. Verify the Room exists and isFinalized is false
        Room room = roomRepository.findByCode(normalizedCode)
                .orElseThrow(() -> new IllegalArgumentException("Room not found with code: " + normalizedCode));

        if (room.isFinalized()) {
            throw new IllegalStateException("Room " + normalizedCode + " is already finalized. Voting is closed.");
        }

        // 2. Verify the RoomMember exists and belongs to the room
        RoomMember member = roomMemberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found with ID: " + memberId));

        if (!member.getRoom().getCode().equalsIgnoreCase(normalizedCode)) {
            throw new IllegalArgumentException("Member " + memberId + " does not belong to room " + normalizedCode);
        }

        // 3. Ensure the Movie exists in local database to satisfy the foreign key constraint
        String movieId = request.movieId().trim();
        Movie movie = movieRepository.findById(movieId)
                .orElseGet(() -> {
                    Movie newMovie = new Movie(
                            movieId,
                            request.movieTitle() != null ? request.movieTitle() : "Movie " + movieId,
                            request.releaseYear() > 0 ? request.releaseYear() : 2024,
                            request.language() != null ? request.language() : "English"
                    );
                    return movieRepository.save(newMovie);
                });

        // 4. Check if a Vote already exists for this member and movie. If yes update, else create new
        Vote vote = voteRepository.findByRoomCodeAndMovieIdAndRoomMemberId(normalizedCode, movie.getId(), member.getId())
                .orElseGet(() -> new Vote(room, movie, member, request.choice()));

        vote.setChoice(request.choice());

        // 5. Save the Vote and return VoteResponse
        Vote savedVote = voteRepository.save(vote);

        return new VoteResponse(
                savedVote.getId(),
                room.getCode(),
                movie.getId(),
                member.getId(),
                savedVote.getChoice().name()
        );
    }

    @Transactional(readOnly = true)
    public List<VoteResponse> getVotes(String roomCode) {
        if (roomCode == null || roomCode.trim().isEmpty()) {
            throw new IllegalArgumentException("Room code must not be empty.");
        }
        String normalizedCode = roomCode.trim().toUpperCase();
        List<Vote> votes = voteRepository.findByRoomCode(normalizedCode);
        return votes.stream()
                .map(v -> new VoteResponse(
                        v.getId(),
                        v.getRoom().getCode(),
                        v.getMovie().getId(),
                        v.getRoomMember().getId(),
                        v.getChoice().name()
                ))
                .toList();
    }

    public void finalizeVoting(String roomCode, UUID hostId, FinalizeRequest request) {
        if (roomCode == null || roomCode.trim().isEmpty()) {
            throw new IllegalArgumentException("Room code must not be empty.");
        }
        if (hostId == null) {
            throw new IllegalArgumentException("Host ID must not be null.");
        }

        String normalizedCode = roomCode.trim().toUpperCase();

        // 1. Verify the Room exists and is not already finalized
        Room room = roomRepository.findByCode(normalizedCode)
                .orElseThrow(() -> new IllegalArgumentException("Room not found with code: " + normalizedCode));

        if (room.isFinalized()) {
            throw new IllegalStateException("Room " + normalizedCode + " is already finalized.");
        }

        // 2. Verify the RoomMember (hostId) exists, belongs to the room, and isHost is true
        RoomMember member = roomMemberRepository.findById(hostId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found with ID: " + hostId));

        if (!member.getRoom().getCode().equalsIgnoreCase(normalizedCode)) {
            throw new IllegalArgumentException("Member " + hostId + " does not belong to room " + normalizedCode);
        }

        if (!member.isHost()) {
            throw new IllegalArgumentException("Only the host is authorized to finalize voting for room " + normalizedCode);
        }

        // 3. Resolve winner movie ID from request or by tallying all room votes
        String winnerId = (request != null && request.winnerMovieId() != null && !request.winnerMovieId().trim().isEmpty())
                ? request.winnerMovieId().trim()
                : null;

        if (winnerId == null) {
            List<Vote> votes = voteRepository.findByRoomCode(normalizedCode);
            Map<String, Integer> movieScores = new HashMap<>();
            for (Vote v : votes) {
                int points = switch (v.getChoice()) {
                    case YES ->
                        2;
                    case MAYBE ->
                        1;
                    case NO ->
                        0;
                };
                movieScores.merge(v.getMovie().getId(), points, Integer::sum);
            }
            winnerId = movieScores.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse(null);
        }

        if (winnerId == null) {
            throw new IllegalStateException("Cannot finalize: no votes have been cast in room " + normalizedCode);
        }

        // 4. Set room as finalized and record winner movie ID
        room.setFinalized(true);
        room.setWinnerMovieId(winnerId);

        // 5. Save the Room
        roomRepository.save(room);
    }
}
