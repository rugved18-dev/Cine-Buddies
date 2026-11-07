package com.cinebuddies.service;

import com.cinebuddies.dto.CreateRoomRequest;
import com.cinebuddies.dto.JoinRoomRequest;
import com.cinebuddies.dto.RoomMemberResponse;
import com.cinebuddies.dto.RoomResponse;
import com.cinebuddies.exception.ResourceNotFoundException;
import com.cinebuddies.model.Room;
import com.cinebuddies.model.RoomMember;
import com.cinebuddies.repository.RoomMemberRepository;
import com.cinebuddies.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;

@Service
@Transactional
public class RoomService {

    private static final String CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int CODE_LENGTH = 6;
    private final SecureRandom random = new SecureRandom();

    private final RoomRepository roomRepository;
    private final RoomMemberRepository roomMemberRepository;

    public RoomService(RoomRepository roomRepository, RoomMemberRepository roomMemberRepository) {
        this.roomRepository = roomRepository;
        this.roomMemberRepository = roomMemberRepository;
    }

    public RoomResponse createRoom(CreateRoomRequest request) {
        String code = generateUniqueRoomCode();
        String roomName = (request.name() != null && !request.name().trim().isEmpty())
                ? request.name().trim()
                : "Movie Night";

        Room room = new Room(code, roomName, request.contentTypes());
        Room savedRoom = roomRepository.save(room);

        String hostDisplayName = (request.hostName() != null && !request.hostName().trim().isEmpty())
                ? request.hostName().trim()
                : "Host";

        RoomMember hostMember = new RoomMember(savedRoom, hostDisplayName, true, true);
        RoomMember savedHost = roomMemberRepository.save(hostMember);

        savedRoom.addMember(savedHost);

        return toRoomResponse(savedRoom);
    }

    public RoomResponse joinRoom(String code, JoinRoomRequest request) {
        String normalizedCode = (code != null) ? code.trim().toUpperCase() : "";
        Room room = roomRepository.findByCode(normalizedCode)
                .orElseThrow(() -> new ResourceNotFoundException("No room was found with code '" + normalizedCode + "'."));

        if (room.isFinalized()) {
            throw new RuntimeException("Cannot join room '" + normalizedCode + "' because voting has already been finalized.");
        }

        String displayName = (request.displayName() != null && !request.displayName().trim().isEmpty())
                ? request.displayName().trim()
                : "Guest";

        boolean alreadyMember = roomMemberRepository.existsByRoomCodeAndDisplayName(normalizedCode, displayName);

        if (!alreadyMember) {
            RoomMember newMember = new RoomMember(room, displayName, false, true);
            RoomMember savedMember = roomMemberRepository.save(newMember);
            room.addMember(savedMember);
        }

        return toRoomResponse(room);
    }

    @Transactional(readOnly = true)
    public RoomResponse getRoom(String code) {
        String normalizedCode = (code != null) ? code.trim().toUpperCase() : "";
        Room room = roomRepository.findByCode(normalizedCode)
                .orElseThrow(() -> new ResourceNotFoundException("No room was found with code '" + normalizedCode + "'."));
        return toRoomResponse(room);
    }

    private String generateUniqueRoomCode() {
        String code;
        int attempts = 0;
        do {
            if (attempts++ > 100) {
                throw new RuntimeException("Failed to generate a unique room code. Please try again.");
            }
            StringBuilder sb = new StringBuilder(CODE_LENGTH);
            for (int i = 0; i < CODE_LENGTH; i++) {
                int index = random.nextInt(CODE_ALPHABET.length());
                sb.append(CODE_ALPHABET.charAt(index));
            }
            code = sb.toString();
        } while (roomRepository.findByCode(code).isPresent());

        return code;
    }

    private RoomResponse toRoomResponse(Room room) {
        List<RoomMemberResponse> memberResponses = room.getMembers().stream()
                .map(m -> new RoomMemberResponse(
                        m.getId(),
                        m.getDisplayName(),
                        m.isHost(),
                        m.isHasJoined(),
                        m.isPreferencesSubmitted()
                ))
                .toList();

        return new RoomResponse(
                room.getCode(),
                room.getName(),
                room.getContentTypes(),
                room.getCreatedAt(),
                room.isFinalized(),
                room.getWinnerMovieId(),
                memberResponses
        );
    }
}

