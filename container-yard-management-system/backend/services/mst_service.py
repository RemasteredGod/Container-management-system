import logging
import math
from collections import defaultdict
from heapq import heapify, heappush, heappop

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class MSTOptimizer:
    """
    Minimum Spanning Tree (MST) optimizer for logistics network.
    Uses Kruskal's algorithm to find the optimal network connecting all hubs.
    """
    
    def __init__(self):
        self.mst_edges = []
        self.total_distance = 0
    
    def haversine_distance(self, coord1, coord2):
        """
        Calculate the great circle distance between two points
        on the earth (specified in decimal degrees)
        
        Args:
            coord1: (latitude, longitude) of first point
            coord2: (latitude, longitude) of second point
            
        Returns:
            Distance in kilometers
        """
        # Convert decimal degrees to radians
        lat1, lon1 = coord1
        lat2, lon2 = coord2
        lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])

        # Haversine formula
        dlon = lon2 - lon1
        dlat = lat2 - lat1
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        r = 6371  # Radius of Earth in kilometers
        
        return c * r
    
    class UnionFind:
        """Union Find data structure for detecting cycles in graph"""
        
        def __init__(self, n):
            self.parent = list(range(n))
            self.rank = [0] * n
        
        def find(self, x):
            if self.parent[x] != x:
                self.parent[x] = self.find(self.parent[x])  # Path compression
            return self.parent[x]
        
        def union(self, x, y):
            root_x = self.find(x)
            root_y = self.find(y)
            
            if root_x == root_y:
                return False
            
            # Attach smaller rank tree under root of higher rank tree
            if self.rank[root_x] < self.rank[root_y]:
                self.parent[root_x] = root_y
            elif self.rank[root_x] > self.rank[root_y]:
                self.parent[root_y] = root_x
            else:
                self.parent[root_y] = root_x
                self.rank[root_x] += 1
            
            return True
    
    def build_mst(self, hubs_data):
        """
        Build MST from hub data using Kruskal's algorithm
        
        Args:
            hubs_data: Dictionary mapping hub_id to hub data with coordinates
            
        Returns:
            Tuple of (mst_edges, total_distance)
            mst_edges is list of (hub_id1, hub_id2, distance) tuples
        """
        # Reset previous MST data
        self.mst_edges = []
        self.total_distance = 0
        
        # Process hub data into a flat list with IDs
        hub_list = []
        for major_id, hubs in hubs_data.items():
            for hub in hubs:
                hub_id = hub['id']
                lat = hub['coordinates']['lat']
                lng = hub['coordinates']['lng']
                hub_list.append((hub_id, lat, lng))
        
        n = len(hub_list)
        if n <= 1:
            logger.warning("Not enough hubs to build MST")
            return [], 0
        
        # Build all possible edges
        edges = []
        for i in range(n):
            for j in range(i+1, n):
                hub_id1, lat1, lng1 = hub_list[i]
                hub_id2, lat2, lng2 = hub_list[j]
                
                # Calculate distance between hubs
                distance = self.haversine_distance((lat1, lng1), (lat2, lng2))
                edges.append((distance, i, j, hub_id1, hub_id2))
        
        # Sort edges by distance
        edges.sort()
        
        # Build MST using Kruskal's algorithm
        uf = self.UnionFind(n)
        
        for distance, i, j, hub_id1, hub_id2 in edges:
            if uf.union(i, j):  # If including this edge doesn't form a cycle
                self.mst_edges.append((hub_id1, hub_id2, distance))
                self.total_distance += distance
                
                # MST will have n-1 edges
                if len(self.mst_edges) == n - 1:
                    break
        
        logger.info(f"MST built with {len(self.mst_edges)} edges, total distance: {self.total_distance:.2f} km")
        return self.mst_edges, self.total_distance
    
    def find_shortest_path(self, start_hub_id, end_hub_id):
        """
        Find shortest path between two hubs in the MST
        
        Args:
            start_hub_id: Starting hub ID
            end_hub_id: Ending hub ID
            
        Returns:
            Tuple of (path, distance) where path is a list of hub IDs
        """
        if not self.mst_edges:
            logger.warning("MST not built yet")
            return [], 0
        
        # Build adjacency list from MST edges
        graph = defaultdict(list)
        for u, v, w in self.mst_edges:
            graph[u].append((v, w))
            graph[v].append((u, w))  # MST is undirected
        
        # If either start or end is not in the MST
        if start_hub_id not in graph or end_hub_id not in graph:
            logger.warning(f"Hub not found in MST: {start_hub_id if start_hub_id not in graph else end_hub_id}")
            return [], 0
        
        # Use Dijkstra's algorithm for shortest path
        pq = [(0, start_hub_id, [start_hub_id])]  # (distance, current_hub, path_so_far)
        visited = set()
        
        while pq:
            dist, current, path = heappop(pq)
            
            if current in visited:
                continue
            
            visited.add(current)
            
            if current == end_hub_id:
                return path, dist
            
            for neighbor, weight in graph[current]:
                if neighbor not in visited:
                    new_path = path + [neighbor]
                    heappush(pq, (dist + weight, neighbor, new_path))
        
        logger.warning(f"No path found between {start_hub_id} and {end_hub_id}")
        return [], 0

    def get_mst_for_visualization(self):
        """
        Return MST in a format suitable for frontend visualization
        
        Returns:
            List of edges with source and target hub IDs and distance
        """
        return [
            {
                "source": source,
                "target": target,
                "distance": round(distance, 2)
            } for source, target, distance in self.mst_edges
        ]

# Create a singleton instance for global use
mst_optimizer = MSTOptimizer()