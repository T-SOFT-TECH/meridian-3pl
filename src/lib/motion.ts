/**
 * Motion system — GSAP + ScrollTrigger wrapped as Svelte 5 attachment factories.
 *
 * Principles:
 * - Initial states are set by JS only (gsap.from), so content renders fully
 *   without JS and for crawlers — no CSS-hidden content.
 * - Every factory is a no-op when the user prefers reduced motion.
 * - Transforms/opacity only (compositor-friendly); no layout-thrashing tweens.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Attachment } from 'svelte/attachments';

let registered = false;

function ensureRegistered(): void {
	if (!registered) {
		gsap.registerPlugin(ScrollTrigger);
		registered = true;
	}
}

export function prefersReducedMotion(): boolean {
	return (
		typeof window !== 'undefined' &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches
	);
}

export interface RevealOptions {
	/** CSS selector for children to stagger; reveals the element itself when omitted. */
	targets?: string;
	y?: number;
	delay?: number;
	duration?: number;
	stagger?: number;
	/** ScrollTrigger start position, default 'top 86%'. */
	start?: string;
	/** Play immediately on mount instead of on scroll (for above-the-fold content). */
	immediate?: boolean;
}

/** Fade-and-rise reveal, optionally staggered across child targets. */
export function reveal(options: RevealOptions = {}): Attachment<HTMLElement> {
	return (element) => {
		if (prefersReducedMotion()) return;
		ensureRegistered();

		const targets = options.targets
			? Array.from(element.querySelectorAll(options.targets))
			: element;

		const tween = gsap.from(targets, {
			autoAlpha: 0,
			y: options.y ?? 32,
			duration: options.duration ?? 1,
			delay: options.delay ?? 0,
			stagger: options.stagger ?? 0.09,
			ease: 'power3.out',
			clearProps: 'transform,opacity,visibility',
			scrollTrigger: options.immediate
				? undefined
				: { trigger: element, start: options.start ?? 'top 86%', once: true }
		});

		return () => {
			tween.scrollTrigger?.kill();
			tween.kill();
		};
	};
}

/**
 * Cinematic media reveal: container un-clips while the inner image settles
 * from a slight zoom. Apply to a wrapper containing an <img>.
 */
export function clipReveal(options: { delay?: number; immediate?: boolean } = {}): Attachment<HTMLElement> {
	return (element) => {
		if (prefersReducedMotion()) return;
		ensureRegistered();

		const media = element.querySelector('img, video');
		const timeline = gsap.timeline({
			delay: options.delay ?? 0,
			scrollTrigger: options.immediate
				? undefined
				: { trigger: element, start: 'top 82%', once: true }
		});

		timeline.from(element, {
			clipPath: 'inset(8% 6% 8% 6%)',
			autoAlpha: 0,
			duration: 1.2,
			ease: 'power3.inOut',
			clearProps: 'clipPath,opacity,visibility'
		});
		if (media) {
			timeline.from(
				media,
				{ scale: 1.18, duration: 1.6, ease: 'power3.out', clearProps: 'scale' },
				'<'
			);
		}

		return () => {
			timeline.scrollTrigger?.kill();
			timeline.kill();
		};
	};
}

/** Subtle scrubbed parallax on the inner media of a masked container. */
export function parallax(options: { amount?: number } = {}): Attachment<HTMLElement> {
	return (element) => {
		if (prefersReducedMotion()) return;
		ensureRegistered();

		const media = element.querySelector('img, video');
		if (!media) return;
		const amount = options.amount ?? 12;

		const tween = gsap.fromTo(
			media,
			{ yPercent: -amount },
			{
				yPercent: amount,
				ease: 'none',
				scrollTrigger: {
					trigger: element,
					start: 'top bottom',
					end: 'bottom top',
					scrub: true
				}
			}
		);

		return () => {
			tween.scrollTrigger?.kill();
			tween.kill();
		};
	};
}

/** Counts the element's numeric text up from zero when scrolled into view. */
export function countUp(value: number, options: { suffix?: string; decimals?: number } = {}): Attachment<HTMLElement> {
	return (element) => {
		const suffix = options.suffix ?? '';
		const decimals = options.decimals ?? 0;
		const format = (n: number) => n.toFixed(decimals) + suffix;

		if (prefersReducedMotion()) {
			element.textContent = format(value);
			return;
		}
		ensureRegistered();

		const counter = { n: 0 };
		const tween = gsap.to(counter, {
			n: value,
			duration: 1.8,
			ease: 'power2.out',
			onUpdate: () => {
				element.textContent = format(counter.n);
			},
			scrollTrigger: { trigger: element, start: 'top 88%', once: true }
		});

		return () => {
			tween.scrollTrigger?.kill();
			tween.kill();
			element.textContent = format(value);
		};
	};
}

/** Grows a horizontal hairline from 0 to full width when in view. */
export function lineGrow(options: { delay?: number } = {}): Attachment<HTMLElement> {
	return (element) => {
		if (prefersReducedMotion()) return;
		ensureRegistered();

		const tween = gsap.from(element, {
			scaleX: 0,
			transformOrigin: 'left center',
			duration: 1.4,
			delay: options.delay ?? 0,
			ease: 'power3.inOut',
			clearProps: 'transform',
			scrollTrigger: { trigger: element, start: 'top 90%', once: true }
		});

		return () => {
			tween.scrollTrigger?.kill();
			tween.kill();
		};
	};
}
