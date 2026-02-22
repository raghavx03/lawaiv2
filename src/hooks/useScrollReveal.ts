'use client'

import { useEffect, useRef } from 'react'

/**
 * Hook that activates scroll-reveal animations using IntersectionObserver.
 * Elements with classes: reveal, reveal-left, reveal-right, reveal-scale
 * will animate in when they enter the viewport.
 * 
 * Safe for SSR — only runs on the client.
 */
export function useScrollReveal() {
    const initialized = useRef(false)

    useEffect(() => {
        // Prevent double initialization in Strict Mode
        if (initialized.current) return
        initialized.current = true

        // Check for reduced motion preference
        if (typeof window === 'undefined') return
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (prefersReducedMotion) return

        // Small delay to allow DOM to render
        const timer = setTimeout(() => {
            const revealElements = document.querySelectorAll(
                '.reveal, .reveal-left, .reveal-right, .reveal-scale'
            )

            if (revealElements.length === 0) return

            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('active')
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
        }, 100)

        return () => clearTimeout(timer)
    }, [])
}
