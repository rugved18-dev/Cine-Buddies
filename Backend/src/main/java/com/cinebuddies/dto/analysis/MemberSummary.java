package com.cinebuddies.dto.analysis;

import java.util.List;
import java.util.UUID;

public record MemberSummary(
    UUID memberId,
    String displayName,
    List<String> genres,
    List<String> excludedGenres
) {}

