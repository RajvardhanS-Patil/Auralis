"""
One Euro Filter — Adaptive low-pass filter for real-time signal smoothing.

The One Euro Filter dynamically adjusts its cutoff frequency based on the
speed of the input signal:
  - When the signal is slow/still → aggressive filtering (kills jitter)
  - When the signal moves fast    → light filtering (preserves responsiveness)

Reference: Géry Casiez, Nicolas Roussel, Daniel Vogel.
"1€ Filter: A Simple Speed-based Low-pass Filter for Noisy Input in Interactive Systems"
CHI 2012. https://dl.acm.org/doi/10.1145/2207676.2208639
"""

import math


class LowPassFilter:
    """Simple first-order low-pass filter."""

    def __init__(self, alpha: float = 1.0):
        self._y = 0.0
        self._s = 0.0
        self._initialized = False
        self._alpha = alpha

    def _compute_alpha(self, cutoff: float, dt: float) -> float:
        """Compute smoothing factor from cutoff frequency and timestep."""
        tau = 1.0 / (2.0 * math.pi * cutoff)
        return 1.0 / (1.0 + tau / dt)

    def filter(self, value: float, dt: float, cutoff: float) -> float:
        """Apply the low-pass filter to a new value."""
        alpha = self._compute_alpha(cutoff, dt)
        if not self._initialized:
            self._s = value
            self._initialized = True
        else:
            self._s = alpha * value + (1.0 - alpha) * self._s
        self._y = value
        return self._s

    def last_value(self) -> float:
        """Return the last raw (unfiltered) value."""
        return self._y

    def reset(self):
        """Reset filter state."""
        self._initialized = False


class OneEuroFilter:
    """
    One Euro Filter for a single scalar signal.

    Parameters
    ----------
    freq : float
        Expected signal frequency in Hz (e.g., 30 for 30 FPS camera).
    min_cutoff : float
        Minimum cutoff frequency. Lower = more smoothing when still.
        Typical range: 0.5 – 5.0. Start with 1.0.
    beta : float
        Speed coefficient. Higher = less lag during fast movements.
        Typical range: 0.0 – 1.0. Start with 0.007.
    d_cutoff : float
        Cutoff frequency for the derivative filter. Usually 1.0.
    """

    def __init__(
        self,
        freq: float = 30.0,
        min_cutoff: float = 1.0,
        beta: float = 0.007,
        d_cutoff: float = 1.0,
    ):
        self.freq = freq
        self.min_cutoff = min_cutoff
        self.beta = beta
        self.d_cutoff = d_cutoff
        self._x_filter = LowPassFilter()
        self._dx_filter = LowPassFilter()
        self._last_time = None

    def __call__(self, x: float, timestamp: float = None) -> float:
        """
        Filter a new value.

        Parameters
        ----------
        x : float
            The raw input value.
        timestamp : float, optional
            Current time in seconds. If None, uses the configured freq.

        Returns
        -------
        float
            The filtered value.
        """
        if self._last_time is not None and timestamp is not None:
            dt = timestamp - self._last_time
            if dt <= 0:
                dt = 1.0 / self.freq
            self.freq = 1.0 / dt
        else:
            dt = 1.0 / self.freq

        self._last_time = timestamp

        # Estimate the derivative of the signal
        prev = self._x_filter.last_value()
        dx = (x - prev) / dt if self._x_filter._initialized else 0.0
        edx = self._dx_filter.filter(dx, dt, self.d_cutoff)

        # Adaptive cutoff: faster movement → higher cutoff → less filtering
        cutoff = self.min_cutoff + self.beta * abs(edx)

        return self._x_filter.filter(x, dt, cutoff)

    def reset(self):
        """Reset the filter to uninitialized state."""
        self._x_filter.reset()
        self._dx_filter.reset()
        self._last_time = None


class OneEuroFilter2D:
    """
    Convenience wrapper: applies One Euro Filtering independently to X and Y.

    Parameters
    ----------
    freq : float
        Expected signal frequency in Hz.
    min_cutoff : float
        Minimum cutoff frequency (smoothing strength when still).
    beta : float
        Speed coefficient (responsiveness during fast movement).
    d_cutoff : float
        Derivative cutoff frequency.
    """

    def __init__(
        self,
        freq: float = 30.0,
        min_cutoff: float = 1.0,
        beta: float = 0.007,
        d_cutoff: float = 1.0,
    ):
        self._fx = OneEuroFilter(freq, min_cutoff, beta, d_cutoff)
        self._fy = OneEuroFilter(freq, min_cutoff, beta, d_cutoff)

    def __call__(
        self, x: float, y: float, timestamp: float = None
    ) -> tuple[float, float]:
        """Filter a 2D point and return the smoothed (x, y)."""
        return self._fx(x, timestamp), self._fy(y, timestamp)

    def reset(self):
        """Reset both axis filters."""
        self._fx.reset()
        self._fy.reset()
