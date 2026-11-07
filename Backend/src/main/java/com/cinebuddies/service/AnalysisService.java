package com.cinebuddies.service;

import com.cinebuddies.dto.analysis.ContentTypeDistribution;
import com.cinebuddies.dto.analysis.GroupAnalysisResponse;
import com.cinebuddies.dto.analysis.MemberSummary;
import com.cinebuddies.model.ContentType;
import com.cinebuddies.model.MemberPreference;
import com.cinebuddies.model.Room;
import com.cinebuddies.repository.MemberPreferenceRepository;
import com.cinebuddies.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AnalysisService {

    private final RoomRepository roomRepository;
    private final MemberPreferenceRepository memberPreferenceRepository;

    public AnalysisService(
            RoomRepository roomRepository,
            MemberPreferenceRepository memberPreferenceRepository
    ) {
        this.roomRepository = roomRepository;
        this.memberPreferenceRepository = memberPreferenceRepository;
    }

    public GroupAnalysisResponse analyzeRoom(String roomCode) {
        if (roomCode == null || roomCode.trim().isEmpty()) {
            throw new IllegalArgumentException("Room code must not be empty.");
        }

        String normalizedCode = roomCode.trim().toUpperCase();

        // 1. Verify Room exists
        Room room = roomRepository.findByCode(normalizedCode)
                .orElseThrow(() -> new IllegalArgumentException("Room not found with code: " + normalizedCode));

        // 2. Fetch all MemberPreference records for this room
        List<MemberPreference> preferences = memberPreferenceRepository.findAllByRoomCode(normalizedCode);

        // Calculate Content Type Distribution based on room.getContentTypes()
        List<ContentTypeDistribution> contentTypeDistribution = calculateContentTypeDistribution(room.getContentTypes());

        // 3. If there are no preferences submitted yet, return empty response
        if (preferences == null || preferences.isEmpty()) {
            return new GroupAnalysisResponse(
                    Collections.emptyList(),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    BigDecimal.valueOf(0.0),
                    contentTypeDistribution,
                    Collections.emptyList(),
                    null
            );
        }

        // 4. Member Summaries
        List<MemberSummary> memberSummaries = preferences.stream()
                .map(p -> new MemberSummary(
                        p.getRoomMember().getId(),
                        p.getRoomMember().getDisplayName(),
                        new ArrayList<>(p.getGenres()),
                        new ArrayList<>(p.getExcludedGenres())
                ))
                .toList();

        // 5. Common Genres (Intersection across all submitted preferences)
        List<String> commonGenres = calculateIntersection(
                preferences.stream().map(MemberPreference::getGenres).toList()
        );

        // 6. Common Languages (Intersection across all submitted preferences)
        List<String> commonLanguages = calculateIntersection(
                preferences.stream().map(MemberPreference::getLanguages).toList()
        );

        // 7. Average Min Rating
        BigDecimal averageMinRating = calculateAverageRating(preferences);

        // 8. Genre Conflicts (Exists in one member's genres but in another's excludedGenres)
        List<String> genreConflicts = calculateGenreConflicts(preferences);

        // 9. Generate Insight String
        String insight = generateInsight(commonGenres, genreConflicts, commonLanguages, averageMinRating);

        return new GroupAnalysisResponse(
                memberSummaries,
                commonGenres,
                commonLanguages,
                averageMinRating,
                contentTypeDistribution,
                genreConflicts,
                insight
        );
    }

    private List<String> calculateIntersection(List<List<String>> listOfLists) {
        if (listOfLists.isEmpty()) {
            return Collections.emptyList();
        }

        // Filter out empty lists if needed, or start with the first member's list
        Set<String> intersection = new LinkedHashSet<>(listOfLists.get(0));

        for (int i = 1; i < listOfLists.size(); i++) {
            List<String> currentList = listOfLists.get(i);
            // Retain elements ignoring case
            intersection.removeIf(item ->
                    currentList.stream().noneMatch(c -> c.equalsIgnoreCase(item))
            );
        }

        return new ArrayList<>(intersection);
    }

    private BigDecimal calculateAverageRating(List<MemberPreference> preferences) {
        BigDecimal sum = BigDecimal.ZERO;
        int count = 0;

        for (MemberPreference p : preferences) {
            if (p.getMinRating() != null) {
                sum = sum.add(p.getMinRating());
                count++;
            }
        }

        if (count == 0) {
            return BigDecimal.valueOf(0.0);
        }

        return sum.divide(BigDecimal.valueOf(count), 1, RoundingMode.HALF_UP);
    }

    private List<ContentTypeDistribution> calculateContentTypeDistribution(List<ContentType> contentTypes) {
        if (contentTypes == null || contentTypes.isEmpty()) {
            return Collections.emptyList();
        }

        Map<ContentType, Long> counts = contentTypes.stream()
                .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()));

        return counts.entrySet().stream()
                .map(entry -> new ContentTypeDistribution(entry.getKey(), entry.getValue().intValue()))
                .toList();
    }

    private List<String> calculateGenreConflicts(List<MemberPreference> preferences) {
        Set<String> conflicts = new LinkedHashSet<>();

        for (int i = 0; i < preferences.size(); i++) {
            MemberPreference p1 = preferences.get(i);
            for (String genre : p1.getGenres()) {
                for (int j = 0; j < preferences.size(); j++) {
                    if (i != j) {
                        MemberPreference p2 = preferences.get(j);
                        boolean isExcluded = p2.getExcludedGenres().stream()
                                .anyMatch(excluded -> excluded.equalsIgnoreCase(genre));
                        if (isExcluded) {
                            conflicts.add(genre);
                        }
                    }
                }
            }
        }

        return new ArrayList<>(conflicts);
    }

    private String generateInsight(
            List<String> commonGenres,
            List<String> genreConflicts,
            List<String> commonLanguages,
            BigDecimal avgRating
    ) {
        if (!commonGenres.isEmpty() && !genreConflicts.isEmpty()) {
            return String.format(
                    "Your group agrees on %s, but has taste conflicts on %s (avg min rating: %s).",
                    String.join(", ", commonGenres),
                    String.join(", ", genreConflicts),
                    avgRating
            );
        } else if (!commonGenres.isEmpty()) {
            return String.format(
                    "Your group strongly agrees on %s with a solid %.1f minimum rating threshold!",
                    String.join(", ", commonGenres),
                    avgRating.doubleValue()
            );
        } else if (!genreConflicts.isEmpty()) {
            return String.format(
                    "Your group has diverse tastes with conflicting views on %s.",
                    String.join(", ", genreConflicts)
            );
        } else {
            return "Your group has diverse taste with no overlapping common genres.";
        }
    }
}

