'use client'

import { useEffect } from 'react'

/**
 * Hook that activates scroll-reveal animations using IntersectionObserver.
 * Elements with classes: reveal, reveal-left, reveal-right, reveal-scale
 * will animate in when they enter the viewport.
 * 
 * Usage: Call useScrollReveal() in any page/layout component.
 */
export function useScrollReveal() {
    useEffect(() => {
        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (prefersReducedMotion) return

        const revealElements = document.querySelectorAll(
            '.reveal, .reveal-left, .reveal-right, .reveal-scale'
        )

        if (revealElements.length === 0) return

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active')
                        // Once revealed, stop observing to save resources
                        observer.unobserve(entry.target)
                    }
                })
            },
            {
                threshold: 0.15,
                rootMargin: '0px 0px -40px 0px',
            }
        )

        revealElements.forEach((el) => observer.observe(el))

        return () => observer.disconnect()
    }, [])
}
