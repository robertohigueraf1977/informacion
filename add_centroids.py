#!/usr/bin/env python3
import json
import os
from shapely.geometry import shape

def add_centroids_to_geojson(input_file):
    """
    Reads a GeoJSON file, calculates centroids for each MultiPolygon feature,
    and adds the centroid coordinates as a 'Centro' property.
    """
    print(f"Processing {input_file}...")
    
    # Read the GeoJSON file
    with open(input_file, 'r') as f:
        data = json.load(f)
    
    # Process each feature
    for feature in data['features']:
        # Convert GeoJSON geometry to shapely geometry
        geometry = shape(feature['geometry'])
        
        # Calculate centroid
        centroid = geometry.centroid
        
        # Add centroid coordinates as [longitude, latitude] to properties
        feature['properties']['Centro'] = [centroid.x, centroid.y]
    
    # Write the updated GeoJSON back to the file
    with open(input_file, 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"Centroids added to {input_file}")

if __name__ == "__main__":
    input_file = "Secciones.geojson"
    if not os.path.exists(input_file):
        print(f"Error: File {input_file} not found.")
        exit(1)
    
    add_centroids_to_geojson(input_file)
    print("Done!")

