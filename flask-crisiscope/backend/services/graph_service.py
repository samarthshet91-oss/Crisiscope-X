"""
CRISISCOPE X — Graph Service
Topological dependency graph, directed corridor analysis, and reachability traversal.
"""

from typing import List, Dict, Any, Set
from .dataset_service import INITIAL_FACILITIES, INITIAL_ROAD_SEGMENTS

INITIAL_GRAPH_NODES = [
    {"id": "NODE-CENTRAL-MAJESTIC", "label": "Majestic Central Interchange", "type": "ROAD_INTERSECTION", "latitude": 12.9774, "longitude": 77.5708, "isIsolated": False},
    {"id": "NODE-MG-ROAD-JUNCTION", "label": "MG Road Metro Gateway", "type": "ROAD_INTERSECTION", "latitude": 12.9754, "longitude": 77.6080, "isIsolated": False},
    {"id": "NODE-INDIRANAGAR-100FT", "label": "Indiranagar 100ft Node", "type": "ROAD_INTERSECTION", "latitude": 12.9784, "longitude": 77.6408, "isIsolated": False},
    {"id": "NODE-SILKBOARD-JUNCTION", "label": "Silk Board Inundation Chokepoint", "type": "ROAD_INTERSECTION", "latitude": 12.9176, "longitude": 77.6238, "isIsolated": False},
    {"id": "NODE-KORAMANGALA-SONY", "label": "Koramangala 80ft Signal", "type": "ROAD_INTERSECTION", "latitude": 12.9352, "longitude": 77.6245, "isIsolated": False},
    {"id": "NODE-BELLANDUR-ECOSPACE", "label": "Outer Ring Road Bellandur Bridge", "type": "BRIDGE_CROSSING", "latitude": 12.9260, "longitude": 77.6762, "isIsolated": False},
    {"id": "NODE-MARATHAHALLI-BRIDGE", "label": "Marathahalli Multiplex Crossing", "type": "BRIDGE_CROSSING", "latitude": 12.9569, "longitude": 77.7011, "isIsolated": False},
    {"id": "NODE-HEBBAL-FLYOVER", "label": "Hebbal Elevated Junction", "type": "BRIDGE_CROSSING", "latitude": 13.0358, "longitude": 77.5970, "isIsolated": False},
    {"id": "NODE-JAYANAGAR-SOUTH", "label": "South End Circle Jayanagar", "type": "ROAD_INTERSECTION", "latitude": 12.9380, "longitude": 77.5800, "isIsolated": False},
    {"id": "NODE-ELECTRONIC-CITY-TOLL", "label": "Electronic City Flyover Gateway", "type": "ROAD_INTERSECTION", "latitude": 12.8452, "longitude": 77.6602, "isIsolated": False},
    {"id": "NODE-WHITEFIELD-HOPE-FARM", "label": "Hope Farm Junction Synth", "type": "ROAD_INTERSECTION", "latitude": 12.9840, "longitude": 77.7520, "isIsolated": False},
    {"id": "NODE-BANASHANKARI-HUB", "label": "Banashankari Bus Terminal Node", "type": "ROAD_INTERSECTION", "latitude": 12.9255, "longitude": 77.5468, "isIsolated": False},
]

INITIAL_GRAPH_EDGES = [
    {"id": "EDGE-MAJ-MG", "fromNodeId": "NODE-CENTRAL-MAJESTIC", "toNodeId": "NODE-MG-ROAD-JUNCTION", "dependencyType": "PRIMARY_ACCESS_ROUTE", "weight": 4.1, "criticality": "HIGH", "isSevered": False, "provenance": "SYNTHETIC_DEMO_FIXTURE_V1"},
    {"id": "EDGE-MG-IND", "fromNodeId": "NODE-MG-ROAD-JUNCTION", "toNodeId": "NODE-INDIRANAGAR-100FT", "dependencyType": "PRIMARY_ACCESS_ROUTE", "weight": 3.6, "criticality": "HIGH", "isSevered": False, "provenance": "SYNTHETIC_DEMO_FIXTURE_V1"},
    {"id": "EDGE-IND-MAR", "fromNodeId": "NODE-INDIRANAGAR-100FT", "toNodeId": "NODE-MARATHAHALLI-BRIDGE", "dependencyType": "AMBULANCE_CORRIDOR", "weight": 5.2, "criticality": "CRITICAL", "isSevered": False, "provenance": "SYNTHETIC_DEMO_FIXTURE_V1"},
    {"id": "EDGE-MAR-WHI", "fromNodeId": "NODE-MARATHAHALLI-BRIDGE", "toNodeId": "NODE-WHITEFIELD-HOPE-FARM", "dependencyType": "BACKUP_EVACUATION_LANE", "weight": 6.3, "criticality": "MODERATE", "isSevered": False, "provenance": "SYNTHETIC_DEMO_FIXTURE_V1"},
    {"id": "EDGE-MAR-BEL", "fromNodeId": "NODE-MARATHAHALLI-BRIDGE", "toNodeId": "NODE-BELLANDUR-ECOSPACE", "dependencyType": "AMBULANCE_CORRIDOR", "weight": 4.2, "criticality": "CRITICAL", "isSevered": False, "provenance": "SYNTHETIC_DEMO_FIXTURE_V1"},
    {"id": "EDGE-BEL-SIL", "fromNodeId": "NODE-BELLANDUR-ECOSPACE", "toNodeId": "NODE-SILKBOARD-JUNCTION", "dependencyType": "PRIMARY_ACCESS_ROUTE", "weight": 5.5, "criticality": "CRITICAL", "isSevered": False, "provenance": "SYNTHETIC_DEMO_FIXTURE_V1"},
    {"id": "EDGE-SIL-ECI", "fromNodeId": "NODE-SILKBOARD-JUNCTION", "toNodeId": "NODE-ELECTRONIC-CITY-TOLL", "dependencyType": "PRIMARY_ACCESS_ROUTE", "weight": 8.5, "criticality": "CRITICAL", "isSevered": True, "provenance": "SYNTHETIC_DEMO_FIXTURE_V1"},
    {"id": "EDGE-SIL-KOR", "fromNodeId": "NODE-SILKBOARD-JUNCTION", "toNodeId": "NODE-KORAMANGALA-SONY", "dependencyType": "AMBULANCE_CORRIDOR", "weight": 2.1, "criticality": "CRITICAL", "isSevered": False, "provenance": "SYNTHETIC_DEMO_FIXTURE_V1"},
    {"id": "EDGE-KOR-MG", "fromNodeId": "NODE-KORAMANGALA-SONY", "toNodeId": "NODE-MG-ROAD-JUNCTION", "dependencyType": "BACKUP_EVACUATION_LANE", "weight": 4.8, "criticality": "HIGH", "isSevered": False, "provenance": "SYNTHETIC_DEMO_FIXTURE_V1"},
    {"id": "EDGE-MAJ-HEB", "fromNodeId": "NODE-CENTRAL-MAJESTIC", "toNodeId": "NODE-HEBBAL-FLYOVER", "dependencyType": "PRIMARY_ACCESS_ROUTE", "weight": 6.8, "criticality": "HIGH", "isSevered": False, "provenance": "SYNTHETIC_DEMO_FIXTURE_V1"},
    {"id": "EDGE-MAJ-JAY", "fromNodeId": "NODE-CENTRAL-MAJESTIC", "toNodeId": "NODE-JAYANAGAR-SOUTH", "dependencyType": "PRIMARY_ACCESS_ROUTE", "weight": 4.5, "criticality": "HIGH", "isSevered": False, "provenance": "SYNTHETIC_DEMO_FIXTURE_V1"},
    {"id": "EDGE-JAY-BAN", "fromNodeId": "NODE-JAYANAGAR-SOUTH", "toNodeId": "NODE-BANASHANKARI-HUB", "dependencyType": "BACKUP_EVACUATION_LANE", "weight": 3.8, "criticality": "MODERATE", "isSevered": False, "provenance": "SYNTHETIC_DEMO_FIXTURE_V1"},
    {"id": "EDGE-KOR-PWR", "fromNodeId": "NODE-KORAMANGALA-SONY", "toNodeId": "NODE-BELLANDUR-ECOSPACE", "dependencyType": "POWER_FEEDER_LINK", "weight": 5.0, "criticality": "HIGH", "isSevered": False, "provenance": "SYNTHETIC_DEMO_FIXTURE_V1"},
]

class GraphService:
    def __init__(self):
        self.nodes = list(INITIAL_GRAPH_NODES)
        self.edges = list(INITIAL_GRAPH_EDGES)

    def analyze_cascade(self, declared_disruptions: List[str]) -> Dict[str, Any]:
        """
        Executes real topological traversal from emergency dispatch roots.
        Evaluates reachable nodes, severed corridors, and isolated facilities.
        """
        cascade_steps = []
        step_counter = 1

        # 1. Identify severed endpoints from road disruptions
        severed_endpoints: Set[str] = set()
        disruption_set = set(declared_disruptions)

        for road in INITIAL_ROAD_SEGMENTS:
            if road["id"] in disruption_set or road.get("isDisrupted"):
                severed_endpoints.add(f"{road['fromNodeId']}->{road['toNodeId']}")
                severed_endpoints.add(f"{road['toNodeId']}->{road['fromNodeId']}")
                cascade_steps.append({
                    "step": step_counter,
                    "type": "DISRUPTION_TRIGGER",
                    "sourceId": road["id"],
                    "targetId": road["name"],
                    "description": f"Declared roadway disruption on segment [{road['name']}] ({road['fromNodeId']} <-> {road['toNodeId']}).",
                    "severity": "CRITICAL"
                })
                step_counter += 1

        # 2. Update edge states
        evaluated_edges = []
        severed_count = 0
        adj: Dict[str, List[str]] = {n["id"]: [] for n in self.nodes}

        for edge in self.edges:
            pair_forward = f"{edge['fromNodeId']}->{edge['toNodeId']}"
            pair_backward = f"{edge['toNodeId']}->{edge['fromNodeId']}"
            
            is_severed = (pair_forward in severed_endpoints or pair_backward in severed_endpoints)
            
            if is_severed:
                severed_count += 1
                cascade_steps.append({
                    "step": step_counter,
                    "type": "EDGE_SEVERED",
                    "sourceId": edge["id"],
                    "targetId": f"{edge['fromNodeId']} -> {edge['toNodeId']}",
                    "description": f"Dependency corridor [{edge['dependencyType']}] severed. Criticality: {edge['criticality']}.",
                    "severity": "CRITICAL" if edge["criticality"] == "CRITICAL" else "WARNING"
                })
                step_counter += 1
            else:
                adj[edge["fromNodeId"]].append(edge["toNodeId"])
                adj[edge["toNodeId"]].append(edge["fromNodeId"])

            evaluated_edges.append({
                **edge,
                "isSevered": is_severed
            })

        # 3. BFS Traversal from Dispatch Roots (Majestic Central & Hebbal Flyover)
        dispatch_roots = ["NODE-CENTRAL-MAJESTIC", "NODE-HEBBAL-FLYOVER"]
        reachable_nodes: Set[str] = set()
        queue = list(dispatch_roots)
        for r in dispatch_roots:
            reachable_nodes.add(r)

        while queue:
            curr = queue.pop(0)
            for neighbor in adj.get(curr, []):
                if neighbor not in reachable_nodes:
                    reachable_nodes.add(neighbor)
                    queue.append(neighbor)

        # 4. Map accessibility and isolated facilities
        node_accessibility = {n["id"]: (n["id"] in reachable_nodes) for n in self.nodes}

        isolated_facilities = []
        accessible_hospitals = 0
        severed_hospitals = 0

        for fac in INITIAL_FACILITIES:
            access_node = fac.get("accessNodeId")
            is_facility_reachable = node_accessibility.get(access_node, False)
            
            if not is_facility_reachable:
                isolated_facilities.append(fac)
                cascade_steps.append({
                    "step": step_counter,
                    "type": "FACILITY_ISOLATED",
                    "sourceId": fac["id"],
                    "targetId": fac["name"],
                    "description": f"Critical facility [{fac['name']}] lost connection to emergency dispatch hub via {access_node}.",
                    "severity": "CRITICAL"
                })
                step_counter += 1
                if fac["type"] == "HOSPITAL":
                    severed_hospitals += 1
            else:
                if fac["type"] == "HOSPITAL":
                    accessible_hospitals += 1

        total_hospitals = accessible_hospitals + severed_hospitals

        return {
            "nodes": [
                {**n, "isIsolated": not node_accessibility.get(n["id"], True)}
                for n in self.nodes
            ],
            "edges": evaluated_edges,
            "severedEdgesCount": severed_count,
            "isolatedFacilities": isolated_facilities,
            "nodeAccessibility": node_accessibility,
            "cascadeSteps": cascade_steps,
            "reachabilitySummary": {
                "totalHospitals": total_hospitals,
                "hospitalsAccessible": accessible_hospitals,
                "hospitalsSevered": severed_hospitals,
            }
        }

graph_service = GraphService()
