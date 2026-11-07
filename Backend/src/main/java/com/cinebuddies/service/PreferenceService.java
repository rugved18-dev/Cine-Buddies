package com.cinebuddies.service;

import com.cinebuddies.dto.preference.PreferenceRequest;
import com.cinebuddies.dto.preference.PreferenceResponse;
import com.cinebuddies.model.MemberPreference;
import com.cinebuddies.model.Room;
import com.cinebuddies.model.RoomMember;
import com.cinebuddies.repository.MemberPreferenceRepository;
import com.cinebuddies.repository.RoomMemberRepository;
import com.cinebuddies.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.UUID;

@Service
@Transactional
public class PreferenceService {

    private final MemberPreferenceRepository memberPreferenceRepository;
    private final RoomMemberRepository roomMemberRepository;
    private final RoomRepository roomRepository;

    public PreferenceService(
            MemberPreferenceRepository memberPreferenceRepository,
            RoomMemberRepository roomMemberRepository,
            RoomRepository roomRepository
    ) {
        this.memberPreferenceRepository = memberPreferenceRepository;
        this.roomMemberRepository = roomMemberRepository;
        this.roomRepository = roomRepository;
    }

    public PreferenceResponse submitPreferences(String roomCode, UUID memberId, PreferenceRequest request) {
        if (roomCode == null || roomCode.trim().isEmpty()) {
            throw new IllegalArgumentException("Room code must not be empty.");
        }
        if (memberId == null) {
            throw new IllegalArgumentException("Member ID must not be null.");
        }
        if (request == null) {
            throw new IllegalArgumentException("Preference request must not be null.");
        }

        // 1. Verify the Room exists and isFinalized is false
        String normalizedCode = roomCode.trim().toUpperCase();
        Room room = roomRepository.findByCode(normalizedCode)
                .orElseThrow(() -> new IllegalArgumentException("Room not found with code: " + normalizedCode));

        if (room.isFinalized()) {
            throw new IllegalStateException("Room " + normalizedCode + " is already finalized. Preferences cannot be updated.");
        }

        // 2. Verify the RoomMember exists by memberId and ensure they belong to roomCode
        RoomMember member = roomMemberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Room member not found with ID: " + memberId));

        if (!member.getRoom().getCode().equalsIgnoreCase(normalizedCode)) {
            throw new IllegalArgumentException("Member " + memberId + " does not belong to room " + normalizedCode);
        }

        // 3. Find existing MemberPreference by roomMemberId, or create a new one
        MemberPreference preferences = memberPreferenceRepository.findByRoomMemberId(memberId)
                .orElseGet(() -> new MemberPreference(member));

        // 4. Update the scalar preference fields
        if (request.minRating() != null) {
            preferences.setMinRating(request.minRating());
        }
        if (request.releasePeriod() != null) {
            preferences.setReleasePeriod(request.releasePeriod());
        }
        preferences.setUpdatedAt(Instant.now());

        // 5. Update the collections: clear existing and addAll to prevent unique constraint issues
        preferences.getGenres().clear();
        if (request.genres() != null) {
            preferences.getGenres().addAll(request.genres());
        }

        preferences.getExcludedGenres().clear();
        if (request.excludedGenres() != null) {
            preferences.getExcludedGenres().addAll(request.excludedGenres());
        }

        preferences.getLanguages().clear();
        if (request.languages() != null) {
            preferences.getLanguages().addAll(request.languages());
        }

        preferences.getWatchedTitles().clear();
        if (request.watchedTitles() != null) {
            preferences.getWatchedTitles().addAll(request.watchedTitles());
        }

        // 6. Save the MemberPreference
        MemberPreference savedPreferences = memberPreferenceRepository.save(preferences);

        // 7. Update RoomMember entity setting preferencesSubmitted = true and save it
        member.setPreferencesSubmitted(true);
        roomMemberRepository.save(member);

        // 8. Return mapped PreferenceResponse
        return new PreferenceResponse(
                savedPreferences.getId(),
                member.getId(),
                new ArrayList<>(savedPreferences.getGenres()),
                new ArrayList<>(savedPreferences.getExcludedGenres()),
                new ArrayList<>(savedPreferences.getLanguages()),
                new ArrayList<>(savedPreferences.getWatchedTitles()),
                savedPreferences.getMinRating(),
                savedPreferences.getReleasePeriod() != null ? savedPreferences.getReleasePeriod().name() : null,
                savedPreferences.getUpdatedAt()
        );
    }
}

