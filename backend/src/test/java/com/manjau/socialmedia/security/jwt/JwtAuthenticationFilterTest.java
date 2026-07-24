package com.manjau.socialmedia.security.jwt;

import com.manjau.socialmedia.security.config.RestAuthenticationEntryPoint;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class JwtAuthenticationFilterTest {

    private final JwtService jwtService = mock(JwtService.class);
    private final JwtAuthenticationFilter filter = new JwtAuthenticationFilter(
            jwtService,
            new RestAuthenticationEntryPoint()
    );

    @Test
    void invalidBearerTokenReturnsUnauthorizedWithoutContinuingTheChain() throws Exception {
        var request = new MockHttpServletRequest("GET", "/api/v1/publications/history");
        request.addHeader("Authorization", "Bearer expired-token");
        var response = new MockHttpServletResponse();
        var chain = mock(FilterChain.class);
        when(jwtService.getUserIdFromToken("expired-token"))
                .thenThrow(new IllegalArgumentException("expired"));

        filter.doFilter(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(401);
        assertThat(response.getContentType()).startsWith("application/json");
        assertThat(response.getContentAsString()).contains("\"status\":401");
        verifyNoInteractions(chain);
    }

    @Test
    void authEndpointsIgnoreAnOldAccessToken() throws Exception {
        var request = new MockHttpServletRequest("POST", "/api/v1/auth/refresh");
        request.setServletPath("/api/v1/auth/refresh");
        request.addHeader("Authorization", "Bearer expired-token");
        var response = new MockHttpServletResponse();
        var chain = mock(FilterChain.class);

        filter.doFilter(request, response, chain);

        verifyNoInteractions(jwtService);
        org.mockito.Mockito.verify(chain).doFilter(request, response);
    }
}
