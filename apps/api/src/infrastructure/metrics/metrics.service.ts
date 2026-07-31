import { Injectable } from "@nestjs/common";
import { Counter, Histogram, Gauge, Summary } from "prom-client";

@Injectable()
export class MetricsService {
  private counters = new Map<string, Counter<string>>();
  private histograms = new Map<string, Histogram<string>>();
  private gauges = new Map<string, Gauge<string>>();
  private summaries = new Map<string, Summary<string>>();

  /**
   * Increments a counter by the given value.
   * If the counter does not exist, it will be created.
   * 
   * @param name Name of the counter
   * @param help Description of the counter
   * @param value Value to increment by (default 1)
   * @param labels Optional labels to attach
   */
  incrementCounter(name: string, help: string, value = 1, labels?: Record<string, string | number>) {
    let counter = this.counters.get(name);
    if (!counter) {
      counter = new Counter({
        name,
        help,
        labelNames: labels ? Object.keys(labels) : [],
      });
      this.counters.set(name, counter);
    }
    if (labels) {
      counter.inc(labels, value);
    } else {
      counter.inc(value);
    }
  }

  /**
   * Records a value in a histogram.
   * Useful for tracking durations or sizes.
   * 
   * @param name Name of the histogram
   * @param help Description of the histogram
   * @param value The observed value (e.g., duration in seconds)
   * @param labels Optional labels to attach
   * @param buckets Optional custom buckets
   */
  recordHistogram(name: string, help: string, value: number, labels?: Record<string, string | number>, buckets?: number[]) {
    let histogram = this.histograms.get(name);
    if (!histogram) {
      histogram = new Histogram({
        name,
        help,
        labelNames: labels ? Object.keys(labels) : [],
        buckets,
      });
      this.histograms.set(name, histogram);
    }
    if (labels) {
      histogram.observe(labels, value);
    } else {
      histogram.observe(value);
    }
  }

  /**
   * Starts a timer for a histogram and returns a function to call when finished.
   * Useful for tracking async operation durations.
   * 
   * @param name Name of the histogram
   * @param help Description of the histogram
   * @param labels Optional labels to attach
   * @param buckets Optional custom buckets
   * @returns A function to call when the operation completes
   */
  startTimer(name: string, help: string, labels?: Record<string, string | number>, buckets?: number[]) {
    let histogram = this.histograms.get(name);
    if (!histogram) {
      histogram = new Histogram({
        name,
        help,
        labelNames: labels ? Object.keys(labels) : [],
        buckets,
      });
      this.histograms.set(name, histogram);
    }
    
    // Returns a closure that stops the timer and observes the duration
    return labels ? histogram.startTimer(labels) : histogram.startTimer();
  }

  /**
   * Sets the value of a gauge.
   * 
   * @param name Name of the gauge
   * @param help Description of the gauge
   * @param value The value to set
   * @param labels Optional labels to attach
   */
  setGauge(name: string, help: string, value: number, labels?: Record<string, string | number>) {
    let gauge = this.gauges.get(name);
    if (!gauge) {
      gauge = new Gauge({
        name,
        help,
        labelNames: labels ? Object.keys(labels) : [],
      });
      this.gauges.set(name, gauge);
    }
    if (labels) {
      gauge.set(labels, value);
    } else {
      gauge.set(value);
    }
  }

  /**
   * Increments a gauge by the given value.
   * 
   * @param name Name of the gauge
   * @param help Description of the gauge
   * @param value The value to increment by (default 1)
   * @param labels Optional labels to attach
   */
  incrementGauge(name: string, help: string, value = 1, labels?: Record<string, string | number>) {
    let gauge = this.gauges.get(name);
    if (!gauge) {
      gauge = new Gauge({
        name,
        help,
        labelNames: labels ? Object.keys(labels) : [],
      });
      this.gauges.set(name, gauge);
    }
    if (labels) {
      gauge.inc(labels, value);
    } else {
      gauge.inc(value);
    }
  }

  /**
   * Decrements a gauge by the given value.
   * 
   * @param name Name of the gauge
   * @param help Description of the gauge
   * @param value The value to decrement by (default 1)
   * @param labels Optional labels to attach
   */
  decrementGauge(name: string, help: string, value = 1, labels?: Record<string, string | number>) {
    let gauge = this.gauges.get(name);
    if (!gauge) {
      gauge = new Gauge({
        name,
        help,
        labelNames: labels ? Object.keys(labels) : [],
      });
      this.gauges.set(name, gauge);
    }
    if (labels) {
      gauge.dec(labels, value);
    } else {
      gauge.dec(value);
    }
  }

  /**
   * Records a value in a summary.
   * 
   * @param name Name of the summary
   * @param help Description of the summary
   * @param value The observed value
   * @param labels Optional labels to attach
   */
  recordSummary(name: string, help: string, value: number, labels?: Record<string, string | number>) {
    let summary = this.summaries.get(name);
    if (!summary) {
      summary = new Summary({
        name,
        help,
        labelNames: labels ? Object.keys(labels) : [],
      });
      this.summaries.set(name, summary);
    }
    if (labels) {
      summary.observe(labels, value);
    } else {
      summary.observe(value);
    }
  }
}
