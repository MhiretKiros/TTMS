package com.amlakie.usermanagment.config;

import com.amlakie.usermanagment.service.JWTUtils;
import com.amlakie.usermanagment.service.OurUserDetailsService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException; // Import a general JWT exception
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger; // Import Logger
import org.slf4j.LoggerFactory; // Import LoggerFactory
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull; // Use @NonNull for clarity
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails; // Explicit import
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils; // Import StringUtils
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JWTAuthFilter extends OncePerRequestFilter {

    // Initialize Logger
    private static final Logger log = LoggerFactory.getLogger(JWTAuthFilter.class);

    @Autowired
    private JWTUtils jwtUtils;

    @Autowired
    private OurUserDetailsService ourUserDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwtToken;
        final String userEmail;

        // Check if the Authorization header is present and starts with "Bearer "
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.trace("No JWT token found in Authorization header or header doesn't start with Bearer, continuing filter chain.");
            filterChain.doFilter(request, response);
            return;
        }

        // Extract the JWT token from the Authorization header
        jwtToken = authHeader.substring(7); // Remove "Bearer " prefix

        // *** ADD THIS CHECK: Ensure token is not empty/blank ***
        if (!StringUtils.hasText(jwtToken)) {
            log.warn("Authorization header had 'Bearer ' prefix but the token itself was empty.");
            filterChain.doFilter(request, response);
            return;
        }
        // *******************************************************

        try {
            // Now it's safer to attempt extraction
            userEmail = jwtUtils.extractUsername(jwtToken);

            // Validate the token and set the authentication in the SecurityContextHolder
            // Check if userEmail is extracted and no authentication is currently set in the context
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                log.debug("Attempting to authenticate user: {}", userEmail);
                UserDetails userDetails = ourUserDetailsService.loadUserByUsername(userEmail);

                if (jwtUtils.isTokenValid(jwtToken, userDetails)) {
                    log.debug("JWT token is valid for user: {}", userEmail);
                    UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null, // Credentials are null for JWT-based auth
                            userDetails.getAuthorities());
                    authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // Set the authentication in the Security Context
                    SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                    log.info("User '{}' successfully authenticated via JWT.", userEmail);
                } else {
                    log.warn("JWT token validation failed for user: {}", userEmail);
                }
            }
        } catch (ExpiredJwtException e) {
            log.warn("JWT token has expired: {}", e.getMessage());
            // Consider sending a 401 response explicitly here if needed
            // response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            // response.getWriter().write("Token expired");
            // return;
        } catch (MalformedJwtException e) {
            // This specific error should be less likely now with the empty check, but good to keep
            log.error("Invalid JWT token format received: {}", e.getMessage());
            // Consider sending a 401 response explicitly here
        } catch (SignatureException e) {
            log.error("Invalid JWT signature: {}", e.getMessage());
            // Consider sending a 401 response explicitly here
        } catch (JwtException e) { // Catch other potential JWT library errors
            log.error("Error processing JWT token: {}", e.getMessage());
            // Consider sending a 401 response explicitly here
        } catch (Exception e) { // Catch unexpected errors during user loading etc.
            log.error("An error occurred during JWT authentication filter processing: {}", e.getMessage(), e);
            // Consider sending a 500 response explicitly here
        }

        // Continue the filter chain regardless of authentication outcome (unless response was explicitly set and returned above)
        filterChain.doFilter(request, response);
    }
}