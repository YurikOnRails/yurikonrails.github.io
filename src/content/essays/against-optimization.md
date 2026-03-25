---
title: Against Optimization
excerpt: We have become so good at optimizing that we have forgotten to ask what we are optimizing for. An argument for slack, waste, and deliberate inefficiency.
status: published
publishedAt: 2026-01-10
tags:
  - thinking
---

The word "optimization" has escaped from mathematics and colonized everyday life. We optimize our morning routines, our meal prep, our commutes, our sleep. We optimize our reading lists, our social media consumption, our friendships. The unexamined assumption beneath all this activity is that optimization is always good — that removing friction and waste from any system improves it.

I want to argue the opposite. Not that optimization is always bad, but that our reflexive pursuit of it has become a problem in itself.

## The efficiency trap

When you optimize a system, you remove slack. Slack is the unused capacity, the buffer, the margin of error that allows a system to absorb shocks. A factory running at 100% capacity is maximally efficient right up until one machine breaks and the entire line stops. A schedule with no free time is maximally productive right up until something unexpected happens and everything cascades into crisis.

![Factory floor at maximum capacity](https://placehold.co/800x400/18181b/a1a1aa?text=100%25+Capacity)

Nassim Taleb calls this the difference between efficiency and robustness. Efficient systems are fragile. Robust systems are, by definition, somewhat wasteful. They maintain capacity they don't currently need, precisely so they can handle situations they haven't yet encountered.

Nature understands this. The human body maintains enormous redundancy — two kidneys, two lungs, far more neural connections than strictly necessary. Evolution optimizes for survival, not efficiency, and survival requires waste.

## The legibility problem

There's a deeper issue with optimization: you can only optimize what you can measure. And many of the most important aspects of any system are precisely the ones that resist measurement.

How do you measure the value of a conversation that doesn't lead to an action item? How do you optimize serendipity? How do you quantify the benefit of an employee spending twenty minutes staring out a window, thinking?

You can't, and so optimization cultures systematically eliminate these activities. The unmeasurable is treated as valueless, and over time, organizations lose exactly the capacities they most need: creativity, judgment, the ability to respond to novel situations with something other than a pre-existing playbook.

Consider a typical "productivity" setup in code:

```typescript
interface Day {
  slots: TimeSlot[]
  utilization: number  // target: 100%
  unplanned: never     // no room for surprise
}

// This is what an optimized calendar looks like
// as a type system. Notice what it cannot express:
// - serendipitous conversations
// - thinking time
// - recovery
// - the thing you don't know you need yet
```

## Slack as strategy

Some of the most innovative companies in history understood the value of deliberate inefficiency. Bell Labs gave researchers freedom to pursue projects with no obvious commercial application. The result was the transistor, information theory, Unix, and the laser. Google's famous "20% time" — whatever its actual implementation — expressed the same insight: that some percentage of organizational capacity should be deliberately unoptimized.

The key word is "deliberately." This is not an argument for laziness or carelessness. It's an argument for intentional slack — for consciously maintaining capacity that serves no immediate purpose but preserves the organization's ability to respond to the unknown.

In software engineering, we have a name for systems that are optimized to the point of fragility: tightly coupled. The antidote is loose coupling — building systems with clear boundaries and deliberate redundancy:

```python
# Tightly coupled — optimized, fragile
def process_order(order):
    validate(order)
    charge_card(order.payment)
    update_inventory(order.items)
    send_confirmation(order.email)
    # If any step fails, everything fails.
    # No slack, no recovery.

# Loosely coupled — "wasteful", resilient
def process_order(order):
    event = OrderPlaced(order)
    event_bus.publish(event)
    # Each downstream service handles its own concern.
    # Redundant? Yes. Resilient? Also yes.
```

The same principle applies to organizations, schedules, and lives.

## The personal dimension

At a personal level, the optimization mindset produces a specific kind of anxiety. If every minute should be optimized, then every minute not spent productively is a failure. Rest becomes something to be minimized. Hobbies must be "productive." Relationships are evaluated by their "return on investment."

This is, of course, insane. But it's the logical endpoint of applying optimization thinking to a human life. And it's surprisingly common among the kind of ambitious, driven people who are drawn to technology and building things.

![An over-scheduled calendar with no white space](https://placehold.co/800x400/18181b/a1a1aa?text=No+White+Space)

The antidote is not anti-ambition. It's a more sophisticated understanding of what ambition is for. If you're optimizing your morning routine to save fifteen minutes, the question is: fifteen minutes for what? If the answer is "more optimizing," you've built a perpetual motion machine of productivity that produces nothing.

## What we lose

When we optimize away the slack in our lives and organizations, we lose specific things:

**Exploration.** Optimization assumes you know what the objective function is. But the most important discoveries — in science, in business, in personal life — come from exploring without a clear destination. You can't optimize your way to a breakthrough; breakthroughs come from the territory that optimization declares wasteful.

**Recovery.** Systems without slack don't recover from failure; they cascade. A life without margin doesn't gracefully handle a sick day, a broken relationship, a sudden change in plans. It shatters.

**Depth.** Optimization favors breadth — doing more things, faster. But the most meaningful work and the deepest relationships require the opposite: doing fewer things, slower. Depth requires the willingness to be "inefficient" — to spend more time on something than a cost-benefit analysis would justify.

## A modest proposal

I'm not suggesting we abandon efficiency entirely. Some optimization is necessary and good. The morning routine that saves you from decision fatigue, the automated deployment pipeline that eliminates manual errors, the well-designed API that reduces integration time — these are genuine improvements.

```yaml
# A healthier model
schedule:
  focused_work: 60%
  slack: 20%        # deliberately unscheduled
  recovery: 10%
  exploration: 10%  # no expected output
```

But I am suggesting that we treat optimization as a tool rather than a value. Use it where it serves you, and put it down where it doesn't. Maintain some deliberate slack in your schedule, your systems, and your thinking. Protect the unmeasurable from the measured. And when someone asks you to justify an activity that doesn't produce measurable output, consider the possibility that the inability to measure its value is precisely what makes it valuable.

The most important things in life are, almost by definition, the ones you can't optimize.
