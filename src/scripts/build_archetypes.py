#!/usr/bin/env python3
"""
Cluster people by their 12 advantage dimensions and produce
anonymous archetype profiles for the compare page.

Output: src/data/archetypes.json
"""
import json
from pathlib import Path
from collections import Counter
import math

ROOT = Path(__file__).resolve().parents[2]

ADV_FIELDS = [
    "early_family_financial_platform_support_score",
    "parent_family_domain_advantage_score",
    "inherited_audience_business_network_score",
    "elite_institution_performance_pipeline_score",
    "frontier_geography_ecosystem_score",
    "rare_early_tools_facilities_score",
    "dedicated_mentor_coach_tutor_score",
    "exceptional_peer_cofounder_sibling_score",
    "early_online_platform_community_score",
    "direct_customer_domain_exposure_score",
    "prodigy_physical_edge_score",
    "adversity_constraint_catalyst_score",
]

LEV_FIELDS = [
    "started_serious_reps_before_20_score",
    "prior_reps_score",
    "scarce_skill_depth_score",
    "native_distribution_score",
    "elite_ecosystem_network_score",
    "complementary_team_score",
    "structural_wave_score",
    "concentration_intensity_score",
    "capital_safety_score",
    "domain_proximity_score",
]

ADV_LABELS = {
    "early_family_financial_platform_support_score": "Family financial/platform support",
    "parent_family_domain_advantage_score": "Parent domain advantage",
    "inherited_audience_business_network_score": "Inherited audience/network",
    "elite_institution_performance_pipeline_score": "Elite institution pipeline",
    "frontier_geography_ecosystem_score": "Frontier geography/ecosystem",
    "rare_early_tools_facilities_score": "Rare early tools/facilities",
    "dedicated_mentor_coach_tutor_score": "Dedicated mentor/coach",
    "exceptional_peer_cofounder_sibling_score": "Exceptional peers/cofounders",
    "early_online_platform_community_score": "Early online platform/community",
    "direct_customer_domain_exposure_score": "Direct customer/domain exposure",
    "prodigy_physical_edge_score": "Prodigy physical edge",
    "adversity_constraint_catalyst_score": "Adversity catalyst",
}

LEV_LABELS = {
    "started_serious_reps_before_20_score": "Started serious reps before 20",
    "prior_reps_score": "Prior reps (practice hours)",
    "scarce_skill_depth_score": "Scarce skill depth",
    "native_distribution_score": "Native distribution",
    "elite_ecosystem_network_score": "Elite ecosystem network",
    "complementary_team_score": "Complementary team",
    "structural_wave_score": "Structural wave / timing",
    "concentration_intensity_score": "Concentration intensity",
    "capital_safety_score": "Capital safety",
    "domain_proximity_score": "Domain proximity",
}


def load_people():
    with open(ROOT / "src/data/people.json") as f:
        return json.load(f)


def advantage_vector(p):
    return [p.get(f, 0) or 0 for f in ADV_FIELDS]


def leverage_vector(p):
    return [p.get(f, 0) or 0 for f in LEV_FIELDS]


def total_adv(p):
    return sum(advantage_vector(p))


def total_lev(p):
    return sum(leverage_vector(p))


def kmeans(data, k, iterations=100, seed=42):
    """Simple k-means on integer vectors."""
    import random
    random.seed(seed)
    n = len(data)
    dims = len(data[0])

    # Initialize centroids using k-means++ for better starting points
    centroids = [data[random.randrange(n)][:]]
    for _ in range(1, k):
        # Pick point farthest from nearest centroid
        dists = []
        for d in data:
            min_dist = min(sum((c[i] - d[i]) ** 2 for i in range(dims)) for c in centroids)
            dists.append(min_dist)
        # Weighted random by distance
        total = sum(dists)
        if total == 0:
            centroids.append(data[random.randrange(n)][:])
        else:
            r = random.random() * total
            cum = 0
            for i, d in enumerate(data):
                cum += dists[i]
                if cum >= r:
                    centroids.append(d[:])
                    break

    for _ in range(iterations):
        # Assign
        clusters = [[] for _ in range(k)]
        for idx, d in enumerate(data):
            best = 0
            best_dist = float('inf')
            for ci, c in enumerate(centroids):
                dist = sum((d[i] - c[i]) ** 2 for i in range(dims))
                if dist < best_dist:
                    best_dist = dist
                    best = ci
            clusters[best].append(idx)

        # Update centroids
        new_centroids = []
        for ci in range(k):
            if not clusters[ci]:
                new_centroids.append(centroids[ci][:])
                continue
            centroid = []
            for dim in range(dims):
                vals = [data[idx][dim] for idx in clusters[ci]]
                centroid.append(round(sum(vals) / len(vals), 2))
            new_centroids.append(centroid)
        if new_centroids == centroids:
            break
        centroids = new_centroids

    return clusters, centroids


def name_archetype(centroid, people_in_cluster, people):
    """Generate a human-readable name for a cluster based on its centroid."""
    # Get individual dimension values
    v = {f: centroid[i] for i, f in enumerate(ADV_FIELDS)}

    has_elite = v["elite_institution_performance_pipeline_score"] >= 1.5
    has_elite_mod = v["elite_institution_performance_pipeline_score"] >= 1.0
    has_parent_domain = v["parent_family_domain_advantage_score"] >= 1.0
    has_frontier = v["frontier_geography_ecosystem_score"] >= 1.5
    has_frontier_mod = v["frontier_geography_ecosystem_score"] >= 1.0
    has_online = v["early_online_platform_community_score"] >= 1.0
    has_mentor = v["dedicated_mentor_coach_tutor_score"] >= 1.0
    has_mentor_mod = v["dedicated_mentor_coach_tutor_score"] >= 0.8
    has_physical = v["prodigy_physical_edge_score"] >= 1.0
    has_adversity = v["adversity_constraint_catalyst_score"] >= 0.8
    has_family_money = v["early_family_financial_platform_support_score"] >= 1.0
    has_tools = v["rare_early_tools_facilities_score"] >= 1.0
    has_peers = v["exceptional_peer_cofounder_sibling_score"] >= 1.0
    has_network = v["inherited_audience_business_network_score"] >= 0.8
    has_customer = v["direct_customer_domain_exposure_score"] >= 1.0
    has_high_peers = v["exceptional_peer_cofounder_sibling_score"] >= 1.5
    has_no_adversity = v["adversity_constraint_catalyst_score"] < 0.3

    total = sum(centroid)

    # Category distribution in cluster
    cats = Counter(people[i].get("category", "unknown") for i in people_in_cluster)
    top_cat = cats.most_common(1)[0][0] if cats else "unknown"
    top3_cats = [c for c, _ in cats.most_common(3)]
    cohort = Counter(people[i].get("cohort_group", "unknown") for i in people_in_cluster)
    top_cohort = cohort.most_common(1)[0][0] if cohort else "unknown"

    # Detect dominant patterns (ordered by specificity)
    # High advantage (>=9)
    if total >= 9:
        # Domain heir: parent domain + mentor + elite + customer (knowledge transfer + coaching + pipeline)
        if has_parent_domain and has_mentor and has_elite:
            return "The domain heir", "Parents had expertise in the same field, paired with elite coaching and institutional access. Domain knowledge transferred from childhood, then compounded through dedicated mentorship and pipeline programs."
        # Well-connected inheritor: family money + parent domain + network
        if has_family_money and has_parent_domain and has_network:
            return "The well-connected inheritor", "Family wealth, parent domain expertise, and inherited professional networks. Multiple advantages stacking from birth — money, knowledge, and connections."
        # Elite-ecosystem founder: elite institution + frontier geography + peers
        if has_elite and has_frontier and has_peers:
            return "The elite-ecosystem founder", "Elite schooling, grew up in a frontier hub, and found exceptional cofounders/peers. The classic tech-founder advantage stack — place, pipeline, and people."
        # Coached prodigy: elite institution + mentor + physical
        if has_elite and has_mentor and has_physical:
            return "The coached prodigy", "Identified early by an institutional pipeline, developed by dedicated coaches, and backed by a natural physical or talent edge. Common in sports and performance arts."
        # Fallback for high-advantage
        return "The multiply-advantaged", "High advantage scores across several dimensions. Multiple compounding early advantages."

    # Medium advantage (6-9)
    if total >= 6:
        # Platform-native builder: online + customer
        if has_online and has_customer:
            return "The platform-native builder", "Grew up with online platforms and direct audience/customer exposure. Built things people used from an early age. Low traditional advantage, high digital-native leverage."
        # Cofounder-paired builder: high peers + customer (with or without frontier)
        if has_high_peers and has_customer:
            return "The cofounder-paired builder", "Found exceptional cofounders or peers early, with direct customer exposure. Advantage came from people and partnerships, not family wealth or domain inheritance."
        # Hardship-forged athlete: physical + adversity + some mentorship
        if has_physical and has_adversity and has_mentor_mod:
            return "The hardship-forged athlete", "Physical talent plus early adversity that catalyzed drive, channeled through coaching. Common in combat sports and endurance events — hardship became fuel."
        # Pipeline-routed talent: moderate elite + geography + customer, no adversity
        if has_elite_mod and has_frontier_mod and has_customer and has_no_adversity:
            return "The pipeline-routed talent", "Modest family background, but accessed an institutional pipeline (sports system, academy, scholarship) and grew up in a field hub. Place and pipeline opened doors that family wealth couldn't."
        # Ecosystem kid: elite + frontier, no family money
        if has_elite and has_frontier:
            return "The ecosystem kid", "Grew up in a hub of their field with elite institutional access, but without major family wealth or domain inheritance. Place and pipeline opened doors."
        # Mentored talent: mentor + elite, modest family
        if has_mentor and has_elite:
            return "The mentored talent", "Strong mentorship and institutional pipeline, but modest family background. A mentor or coach opened doors that family wealth couldn't."
        # Family-trade inheritor (medium): parent domain only
        if has_parent_domain:
            return "The family-trade inheritor", "Parents worked in the same domain. Knowledge and networks transferred early, without major wealth or elite schooling."
        # Adversity-forged striver
        if has_adversity:
            return "The adversity-forged striver", "Early hardship acted as a catalyst. Low inherited advantage, but adversity created drive and resilience that compensated."
        # Fallback
        return "The moderately-advantaged", "Some early advantages — a mix of mentorship, geography, or institutional access, but no single dominant edge."

    # Lower advantage (4-6)
    if total >= 4:
        if has_adversity:
            return "The self-made striver", "Low inherited advantage. Early adversity or constraint acted as a catalyst. Got there through drive, not head start."
        if has_online:
            return "The digital native", "Low traditional advantage but found opportunity through online platforms and communities."
        if has_mentor:
            return "The scratch-to-talent", "Modest background, but found a mentor or coach who opened doors."
        if has_elite:
            return "The pipeline-routed talent", "Modest background, but accessed an institutional pipeline (sports system, scholarship, academy) that routed them into their field."
        return "The ordinary-background achiever", "Few documented early advantages. Achievement came from drive and timing rather than head start."

    # Very low advantage (<4)
    if has_adversity:
        return "The nothing-handed striver", "Minimal inherited advantage and significant early adversity. Achievement built from scratch."
    return "The from-scratch builder", "Minimal documented early advantages. Got there through sheer drive and timing."


def name_leverage_archetype(centroid, people_in_cluster, people):
    """Generate a human-readable name for a leverage cluster based on its centroid."""
    v = {f: centroid[i] for i, f in enumerate(LEV_FIELDS)}

    has_early_reps = v["started_serious_reps_before_20_score"] >= 0.7
    has_deep_reps = v["prior_reps_score"] >= 2.0
    has_some_reps = v["prior_reps_score"] >= 1.0
    has_scarce_skill = v["scarce_skill_depth_score"] >= 2.0
    has_native_dist = v["native_distribution_score"] >= 1.5
    has_ecosystem_net = v["elite_ecosystem_network_score"] >= 1.5
    has_team = v["complementary_team_score"] >= 1.0
    has_wave = v["structural_wave_score"] >= 2.0
    has_some_wave = v["structural_wave_score"] >= 1.0
    has_concentration = v["concentration_intensity_score"] >= 2.0
    has_capital = v["capital_safety_score"] >= 1.0
    has_domain_prox = v["domain_proximity_score"] >= 1.0

    total = sum(centroid)

    # Category distribution
    cats = Counter(people[i].get("category", "unknown") for i in people_in_cluster)
    top3 = [c for c, _ in cats.most_common(3)]

    # High leverage (>=18)
    if total >= 18:
        if has_wave and has_deep_reps and has_scarce_skill:
            return "The wave-riding specialist", "Rode a structural wave (tech platform, cultural shift) with deep, scarce expertise built through years of reps. Timing plus skill depth — the classic founder combo."
        if has_wave and has_team and has_ecosystem_net:
            return "The well-timed connector", "Rode a structural wave while embedded in a high-signal network with a complementary team. Timing, network, and partnership — leveraged ecosystems over individual skill."
        if has_deep_reps and has_concentration and has_scarce_skill:
            return "The deep specialist", "Exceptional skill depth built through intense concentration and thousands of hours of practice. Got there through sheer depth, not timing or network."
        return "The high-leverage operator", "High scores across multiple leverage dimensions. Combined reps, skill, timing, and network into a compounding stack."

    # Medium-high leverage (14-18)
    if total >= 14:
        if has_wave and has_deep_reps:
            return "The timed rep-builder", "Rode a structural wave while putting in serious reps. Not the deepest specialist, but showed up at the right time with enough skill to catch it."
        if has_wave and has_ecosystem_net:
            return "The ecosystem surfer", "Rode a wave from inside a high-signal network. Timing and connections did the heavy lifting — skill depth was secondary."
        if has_deep_reps and has_concentration:
            return "The relentless practicer", "Thousands of hours of focused, concentrated practice. Got there through consistency and intensity — reps over timing."
        if has_scarce_skill and has_domain_prox:
            return "The domain-embedded expert", "Deep skill in a scarce area, built from direct lived exposure to the problem. Domain proximity fed skill depth."
        if has_wave and has_native_dist:
            return "The audience-first builder", "Rode a wave with owned distribution — an audience or platform that compounded. Distribution was the leverage, not skill depth."
        if has_team and has_ecosystem_net:
            return "The paired operator", "A durable complementary partnership inside a high-signal network. Team and network as leverage — didn't go it alone."
        return "The balanced operator", "Solid scores across multiple leverage dimensions without a single dominant edge. A well-rounded stack."

    # Medium leverage (10-14)
    if total >= 10:
        if has_deep_reps and has_early_reps:
            return "The early starter", "Started serious practice before 20 and accumulated significant reps. Consistency from an early age — the tortoise, not the hare."
        if has_wave and has_some_reps:
            return "The opportunistic rider", "Caught a structural wave with enough reps to hang on. Timing was the primary lever — skill was adequate, not exceptional."
        if has_concentration and has_some_reps:
            return "The focused grinder", "Intense concentration on the domain with moderate reps. Got there through focus and intensity rather than timing or network."
        if has_team:
            return "The partnership lever", "A complementary team or partner was the primary leverage. Built something together that neither could alone."
        if has_ecosystem_net:
            return "The network-native", "Embedded in a high-signal network that provided opportunities, feedback, and distribution. Network as the primary lever."
        return "The moderate lever", "Moderate leverage across several dimensions. Some reps, some timing, some network — but no dominant built advantage."

    # Lower leverage (<10)
    if has_early_reps:
        return "The early beginner", "Started practice early but hasn't yet accumulated deep reps or scarce skill. The foundation is there — the depth isn't yet."
    if has_some_reps:
        return "The rep-accumulator", "Putting in reps but without a structural wave, deep skill, or strong network to amplify them. Consistency without compounding."
    if has_wave:
        return "The lucky timer", "Caught a structural wave but without deep skill, reps, or network to fully exploit it. Timing without the rest of the stack."
    return "The early-stage builder", "Low leverage scores across the board. The built advantages — reps, skill depth, timing, network — haven't compounded yet."


def build_archetypes(people, k=10):
    data = [advantage_vector(p) for p in people]
    clusters, centroids = kmeans(data, k)

    archetypes = []
    for ci, (cluster, centroid) in enumerate(zip(clusters, centroids)):
        if not cluster:
            continue
        name, description = name_archetype(centroid, cluster, people)

        # Average scores
        avg_scores = {}
        for i, f in enumerate(ADV_FIELDS):
            avg_scores[f] = round(centroid[i], 2)

        # Average total
        avg_total = round(sum(centroid), 2)

        # Average milestone age
        ages = [people[i].get("age_at_milestone") for i in cluster if people[i].get("age_at_milestone")]
        avg_age = round(sum(ages) / len(ages), 1) if ages else 0

        # Success tier distribution
        tiers = Counter(people[i].get("success_tier", 4) for i in cluster)
        tier_dist = {str(t): tiers.get(t, 0) for t in range(1, 5)}

        # Category distribution (top 5)
        cats = Counter(people[i].get("category", "unknown") for i in cluster)
        top_cats = [{"category": c, "count": n} for c, n in cats.most_common(5)]

        # Cohort distribution
        cohorts = Counter(people[i].get("cohort_group", "unknown") for i in cluster)
        top_cohorts = [{"cohort": c, "count": n} for c, n in cohorts.most_common(4)]

        # Typical trajectory (sample 3-5 from cluster members with trajectory data)
        trajectories = []
        for i in cluster:
            t = people[i].get("trajectory")
            if t and isinstance(t, list) and len(t) >= 3:
                trajectories.append(t)
        # Pick a few representative ones
        sample_traj = trajectories[:3] if trajectories else []

        archetypes.append({
            "archetype_id": f"archetype-{ci+1}",
            "name": name,
            "description": description,
            "member_count": len(cluster),
            "avg_advantage_scores": avg_scores,
            "avg_total_advantage": avg_total,
            "avg_milestone_age": avg_age,
            "success_tier_distribution": tier_dist,
            "top_categories": top_cats,
            "top_cohorts": top_cohorts,
            "sample_trajectories": sample_traj,
        })

    # Sort by avg_total_advantage descending
    archetypes.sort(key=lambda a: a["avg_total_advantage"], reverse=True)
    # Reassign IDs after sorting
    for i, a in enumerate(archetypes):
        a["archetype_id"] = f"archetype-{i+1}"

    return archetypes


def build_leverage_archetypes(people, k=8):
    data = [leverage_vector(p) for p in people]
    clusters, centroids = kmeans(data, k, seed=99)

    archetypes = []
    for ci, (cluster, centroid) in enumerate(zip(clusters, centroids)):
        if not cluster:
            continue
        name, description = name_leverage_archetype(centroid, cluster, people)

        avg_scores = {}
        for i, f in enumerate(LEV_FIELDS):
            avg_scores[f] = round(centroid[i], 2)

        avg_total = round(sum(centroid), 2)

        ages = [people[i].get("age_at_milestone") for i in cluster if people[i].get("age_at_milestone")]
        avg_age = round(sum(ages) / len(ages), 1) if ages else 0

        tiers = Counter(people[i].get("success_tier", 4) for i in cluster)
        tier_dist = {str(t): tiers.get(t, 0) for t in range(1, 5)}

        cats = Counter(people[i].get("category", "unknown") for i in cluster)
        top_cats = [{"category": c, "count": n} for c, n in cats.most_common(5)]

        cohorts = Counter(people[i].get("cohort_group", "unknown") for i in cluster)
        top_cohorts = [{"cohort": c, "count": n} for c, n in cohorts.most_common(4)]

        archetypes.append({
            "archetype_id": f"lev-archetype-{ci+1}",
            "name": name,
            "description": description,
            "member_count": len(cluster),
            "avg_leverage_scores": avg_scores,
            "avg_total_leverage": avg_total,
            "avg_milestone_age": avg_age,
            "success_tier_distribution": tier_dist,
            "top_categories": top_cats,
            "top_cohorts": top_cohorts,
        })

    archetypes.sort(key=lambda a: a["avg_total_leverage"], reverse=True)
    for i, a in enumerate(archetypes):
        a["archetype_id"] = f"lev-archetype-{i+1}"

    return archetypes


def main():
    people = load_people()
    print(f"Clustering {len(people)} people...")

    adv_archetypes = build_archetypes(people, k=10)
    lev_archetypes = build_leverage_archetypes(people, k=8)

    out = {
        "advantage_archetypes": adv_archetypes,
        "leverage_archetypes": lev_archetypes,
    }

    out_path = ROOT / "src/data/archetypes.json"
    with open(out_path, "w") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)

    print(f"\nWrote {len(adv_archetypes)} advantage archetypes + {len(lev_archetypes)} leverage archetypes to {out_path}")
    print("\nAdvantage archetypes:")
    for a in adv_archetypes:
        print(f"  {a['name']:40s}  {a['member_count']:4d} people  avg_adv={a['avg_total_advantage']:5.1f}  avg_age={a['avg_milestone_age']}")
    print("\nLeverage archetypes:")
    for a in lev_archetypes:
        print(f"  {a['name']:40s}  {a['member_count']:4d} people  avg_lev={a['avg_total_leverage']:5.1f}  avg_age={a['avg_milestone_age']}")


if __name__ == "__main__":
    main()
