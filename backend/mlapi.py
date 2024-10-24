from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel , Field
from database import engine, get_db, SessionLocal
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import NearestNeighbors
from typing import List
import pickle, keras
import pandas as pd
import numpy as np
import trackmodel as trackmodel
import track_playcount as track_playcount
import json



app = FastAPI()
db = SessionLocal()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Replace "*" with the actual URL of your frontend, e.g., ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


    
class TrackInfo(BaseModel):
    artist_name: List[str] = Field(..., min_items=1, max_items=3)
    genre_name: List[str] = Field(..., min_items=1, max_items=3)
    
class track(BaseModel):
    track_id : str
    



# upload music_info

@app.post("/uploadtrack", status_code=200)
def uploadTrack():
    # Function to get similar tracks
    df = pd.read_csv("C:\\Users\\zayna\\Downloads\\Music Info.csv", encoding='utf-8')
    # df1 = pd.read_csv("C:\\Users\\zayna\\Downloads\\User Listening History.csv", encoding='utf-8')
    
    # Store the DataFrame in the PostgreSQL database
    df.to_sql('tracks', con=engine, if_exists='append', index=False)
    # df1.to_sql('track_listening_history', con=engine, if_exists='append', index=False)
    
    return {"message": "Data uploaded successfully"}




# get similar tracks
with open('model_for_similar_songs.pkl', 'rb') as file:
    model = pickle.load(file)

X_test_scaled = np.load('X_train_scaled.npy')
music_info = pd.read_csv('Music Info.csv')
df = music_info.drop(["name", "artist", "spotify_preview_url", "spotify_id", "tags"], axis=1)

# @app.post("/getsimilartrack/{track_id}", status_code = status.HTTP_200_OK)
# def get_similar_tracks_by_id(track_id : str, top_n: int = 10):
#     filtered_df = df[df['track_id'] == track_id]
    
#     if filtered_df.empty:
#         raise HTTPException(status_code=404, detail="Track ID not found")
   
#     track_index = filtered_df.index[0]
#     track_features = X_test_scaled[track_index].reshape(1, -1)
#     similarities = np.dot(X_test_scaled, track_features.T).flatten()
#     similar_indices = np.argsort(similarities)[-top_n:]
#     similar_track_ids = df.iloc[similar_indices]['track_id'].tolist()
    
#     similar_tracks_list = []
#     for similar_track_id in similar_track_ids:
#         track = db.query(trackmodel.track).filter(trackmodel.track.track_id == similar_track_id).first()
#         if track:
#             similar_tracks_list.append({
#                 "track_id": track.track_id,
#                 "track_name": track.name,
#                 "artist": track.artist,
#                 "genre": track.genre
#             })
    
#     return {"similar_tracks": similar_tracks_list}


import joblib

knn_model = joblib.load('knn_model.pkl')

df_encoded = pd.read_csv('df_encoded.csv')
# with open('knn_model.pkl', 'rb') as model_file:
#     knn_model = pickle.load(model_file)
# Function to recommend similar tracks
@app.post("/getsimilartrack/{track_id}", status_code = status.HTTP_200_OK)
def recommend_similar_tracks(track_id:str, n_neighbors:int =10):
    # Find the index of the given track_id
    try:
        track_index = df_encoded[df_encoded['track_id'] == track_id].index[0]
    except IndexError:
        print(f"Track ID {track_id} not found in the dataset.")
        return []

    # Get the row index of the specified track_id
    track_index = df_encoded[df_encoded['track_id'] == track_id].index[0]

    # Extract the feature vector using .iloc to get the row by index
    feature_vector = df_encoded.drop(columns=['track_id']).iloc[track_index]

    # Convert the Series to a DataFrame to retain feature names
    feature_vector_df = feature_vector.to_frame().transpose()

    # Find the nearest neighbors
    distances, indices = knn_model.kneighbors(feature_vector_df)

    # Exclude the input track itself from the results
    similar_indices = indices[0][1:n_neighbors + 1]

    # Get the track IDs of similar tracks
    similar_tracks = df_encoded.iloc[similar_indices]['track_id'].tolist()
    
    similar_tracks_list = []
    for similar_track_id in similar_tracks:
        track = db.query(trackmodel.track).filter(trackmodel.track.track_id == similar_track_id).first()
        if track:
            similar_tracks_list.append({
                "track_id": track.track_id,
                "track_name": track.name,
                "artist": track.artist,
                "genre": track.genre
            })
    
    return {"similar_tracks": similar_tracks_list}




# get popular tracks
# @app.post("/playtrack/{track_id}")
# def play_track(track_id: str, db: Session = Depends(get_db)):
#     # Check if the track exists in the table
#     track_record = db.query(track_playcount.trackcount).filter(track_playcount.trackcount.track_id == track_id).first()
    
#     if track_record:
#         # If the track exists, increment the playcount
#         track_record.playcount += 1
#     else:
#         # If the track does not exist, add it with a playcount of 1
#         new_track = track_playcount.trackcount(track_id=track_id, playcount=1)
#         db.add(new_track)
    
#     db.commit()
    
#     return {"message": f"Track {track_id} playcount incremented."}




# Assuming trackmodel and track_playcount are correctly defined and imported

# @app.get("/popular_songs/")
# def popular_songs(n: int = 10, db: Session = Depends(get_db)):
#     results = (
#         db.query(trackmodel.track, track_playcount.trackcount)
#         .join(track_playcount.trackcount, trackmodel.track.track_id == track_playcount.trackcount.track_id)
#         .order_by(track_playcount.trackcount.playcount.desc())
#         .limit(n)
#         .all()
#     )
    
#     # Format results
#     top_songs = [
#         {
#             "track_id": track.track_id,
#             "track_name": track.name,
#             "artist": track.artist,
#             "genre": track.genre,
#             "playcount": playcount.playcount
#         }
#         for track, playcount in results
#     ]
    
#     return top_songs


# Load your model and data
with open('final_user_based.pkl', 'rb') as listening_file:
    listening_model = pickle.load(listening_file)
    
listening_df = pd.read_csv('User Listening History.csv')
aggregated_df = listening_df.groupby(['track_id', 'user_id'])['playcount'].sum().reset_index()
all_tracks = set(aggregated_df['track_id'].unique())

@app.post("/recommend/{user_id}", status_code=status.HTTP_200_OK)
def recommend_top_tracks(user_id: str, top_n: int = 10):
    # row_count = aggregated_df[aggregated_df['user_id'] == user_id].shape[0]
    predictions = []
    for track_id in all_tracks:
        prediction = listening_model.predict(user_id, track_id)
        predictions.append((track_id, prediction.est))
    
    # Sort the predictions by estimated playcount in descending order
    predictions.sort(key=lambda x: x[1], reverse=True)
    
    # Get the top N tracks
    top_tracks = predictions[:top_n]
    
    top_tracks_json = [{"track_id": track_id, "estimated_playcount": int(est)} for track_id, est in top_tracks]
    detailed_tracks = []
    
    for i in top_tracks_json:
        track = db.query(trackmodel.track).filter(trackmodel.track.track_id == i['track_id']).first()
        if track:
            detailed_tracks.append({
                "track_id": i['track_id'],
                "track_name": track.name,
                "artist": track.artist,
                "genre": track.genre,
                "estimated_playcount": i['estimated_playcount']
            })
    return {"recommended_tracks": detailed_tracks}


@app.get('/populartracks/',status_code=status.HTTP_200_OK)
def get_most_popular_songs(n=10):
    # Filter DataFrame to include only the specified track_ids
    filtered_df = listening_df[listening_df['track_id'].isin(all_tracks)]
    
    # Aggregate playcounts for each track_id
    aggregated_df = filtered_df.groupby('track_id')['playcount'].sum().reset_index()
    
    # Sort tracks by total playcount in descending order
    sorted_df = aggregated_df.sort_values(by='playcount', ascending=False)
    
    # Get the top 'n' songs
    top_songs = sorted_df["track_id"].head(n).tolist()
    top_songs_list = []
    for id in top_songs:
        track = db.query(trackmodel.track).filter(trackmodel.track.track_id == id).first()
        if track:
            top_songs_list.append({
                "track_id": track.track_id,
                "track_name": track.name,
                "artist": track.artist,
                "genre": track.genre})
    
    return top_songs_list



@app.post('/trackinfo_name/{trackname}', status_code=status.HTTP_200_OK)
def get_song_info_track(trackname):
    track = db.query(trackmodel.track).filter(trackmodel.track.name == trackname).first()
    detailed_tracks =[]
    if track:
        detailed_tracks.append({
            "track_id": track.track_id,
            "track_name": track.name,
            "artist": track.artist,
            "genre": track.genre,
        })
    else:
        raise HTTPException(status_code=404, detail="Track not found")

    return {"track_info": detailed_tracks}

@app.post('/trackinfo_id/{id}', status_code=status.HTTP_200_OK)
def get_song_info_track(id):
    track = db.query(trackmodel.track).filter(trackmodel.track.track_id == id).first()
    detailed_tracks =[]
    if track:
        detailed_tracks.append({
            "track_id": track.track_id,
            "track_name": track.name,
            "artist": track.artist,
            "genre": track.genre,
            "year": track.year,
            "link": track.spotify_preview_url,
            "tags" : track.tags,
        })
    else:
        raise HTTPException(status_code=404, detail="Track not found")

    return {"track_info": detailed_tracks}



@app.post('/trackinfo_artist/{artist_name}', status_code=status.HTTP_200_OK)
def get_song_info_artist(artist_name):
    tracks = db.query(trackmodel.track).filter(trackmodel.track.artist == artist_name).limit(12).all()
    detailed_tracks =[]
    if tracks:
        for track in tracks:
            detailed_tracks.append({
                "track_id": track.track_id,
                "track_name": track.name,
                "artist": track.artist,
                "genre": track.genre,
            })
    else:
        raise HTTPException(status_code=404, detail="Artist not found")

    return {"track_info": detailed_tracks}



@app.post('/trackinfo_tag/{tag}', status_code=status.HTTP_200_OK)
def get_song_info_tag(tag):
    tracks = db.query(trackmodel.track).filter(tag in trackmodel.track.tags).limit(12).all()
    detailed_tracks =[]
    if tracks:
        for track in tracks:
            detailed_tracks.append({
                "track_id": track.track_id,
                "track_name": track.name,
                "artist": track.artist,
                "genre": track.genre,
            })
    else:
        raise HTTPException(status_code=404, detail="Tag not found")

    return {"track_info": detailed_tracks}



@app.post('/trackinfo_genre/{genre_name}', status_code=status.HTTP_200_OK)
def get_song_info_genre(genre_name):
    tracks = db.query(trackmodel.track).filter(trackmodel.track.genre == genre_name).limit(12).all()
    detailed_tracks =[]
    if tracks:
        for track in tracks:
            detailed_tracks.append({
                "track_id": track.track_id,
                "track_name": track.name,
                "artist": track.artist,
                "genre": track.genre,
            })
    else:
        raise HTTPException(status_code=404, detail="Genre not found")

    return {"track_info": detailed_tracks}



@app.post('/trackinfo/', status_code=status.HTTP_200_OK)
def get_song_info(track_info: TrackInfo):
    detailed_tracks = []

    # Determine the number of tracks to select based on the number of artists
    artist_track_counts = []
    if len(track_info.artist_name) == 1:
        artist_track_counts = [5]
    elif len(track_info.artist_name) == 2:
        artist_track_counts = [3, 2]
    elif len(track_info.artist_name) == 3:
        artist_track_counts = [2, 2, 1]

    # Iterate over each artist in the list and select the specified number of tracks
    for i, artist_nm in enumerate(track_info.artist_name):
        if i < len(artist_track_counts):
            track_count = artist_track_counts[i]
            tracks = db.query(trackmodel.track).filter(trackmodel.track.artist == artist_nm).limit(track_count).all()
            if tracks:
                for track in tracks:
                    detailed_tracks.append({
                        "track_id": track.track_id,
                        "track_name": track.name,
                        "artist": track.artist,
                        "genre": track.genre,
                    })
            else:
                raise HTTPException(status_code=404, detail=f"Artist '{artist_nm}' not found")

    # Determine the number of tracks to select based on the number of genres
    genre_track_counts = []
    if len(track_info.genre_name) == 1:
        genre_track_counts = [5]
    elif len(track_info.genre_name) == 2:
        genre_track_counts = [3, 2]
    elif len(track_info.genre_name) == 3:
        genre_track_counts = [2, 2, 1]

    # Iterate over each genre in the list and select the specified number of tracks
    for i, tag in enumerate(track_info.genre_name):
        if i < len(genre_track_counts):
            track_count = genre_track_counts[i]
            tracks = db.query(trackmodel.track).filter(trackmodel.track.genre==tag).limit(track_count).all()
            if tracks:
                for track in tracks:
                    detailed_tracks.append({
                        "track_id": track.track_id,
                        "track_name": track.name,
                        "artist": track.artist,
                        "genre": track.genre,
                    })
            else:
                raise HTTPException(status_code=404, detail=f"Genre '{tag}' not found")

    return {"track_info": detailed_tracks}

    
