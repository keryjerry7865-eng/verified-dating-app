import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';

interface LivePartyRoomProps {
  roomDetails: {
    id: string;
    title: string;
    creator_id: string;
    type: 'video' | 'audio';
  };
  currentUser: {
    id: string;
    name: string;
    role: 'host' | 'admin' | 'user';
  };
}

interface Participant {
  id: string;
  name: string;
  isMuted: boolean;
  isOnMic: boolean;
}

export default function LivePartyRoom({ roomDetails, currentUser }: LivePartyRoomProps) {
  const isHostOrAdmin = currentUser.role === 'host' || currentUser.role === 'admin';
  const isVideoRoom = roomDetails.type === 'video';

  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', name: 'Iris', isMuted: false, isOnMic: false },
    { id: '2', name: 'Kritika Sharma', isMuted: false, isOnMic: true },
  ]);

  const [youtubeUrl, setYoutubeUrl] = useState<string>('');
  const [activeYoutubeTrack, setActiveYoutubeTrack] = useState<string>('');
  const [localAudioUrl, setLocalAudioUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const [comments, setComments] = useState<string[]>([
    'Welcome to the live stream.',
    'Iris joined the room.'
  ]);
  const [newComment, setNewComment] = useState<string>('');

  const toggleParticipantMic = (participantId: string) => {
    setParticipants(prev => prev.map(p => {
      if (p.id === participantId) {
        if (!p.isOnMic && participants.filter(user => user.isOnMic).length >= 10) {
          alert('Maximum limit of 10 active microphones reached!');
          return p;
        }
        return { ...p, isOnMic: !p.isOnMic };
      }
      return p;
    }));
  };

  const handleMuteUser = (participantId: string) => {
    if (!isHostOrAdmin) return;
    setParticipants(prev => prev.map(p => 
      p.id === participantId ? { ...p, isMuted: !p.isMuted } : p
    ));
  };

  const handleKickUser = (participantId: string) => {
    if (!isHostOrAdmin) return;
    if (confirm('Are you sure you want to kick this user from the room?')) {
      setParticipants(prev => prev.filter(p => p.id !== participantId));
    }
  };

  const handlePlayYoutube = (e: React.FormEvent) => {
    e.preventDefault();
    if (youtubeUrl.trim()) {
      setActiveYoutubeTrack(youtubeUrl);
      setLocalAudioUrl('');
    }
  };

  const handleLocalAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const blobUrl = URL.createObjectURL(file);
      setLocalAudioUrl(blobUrl);
      setActiveYoutubeTrack('');
    }
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      setComments(prev => [...prev, `${currentUser.name}: ${newComment}`]);
      setNewComment('');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-gradient-to-b from-purple-900 to-indigo-950 text-white min-h-screen flex flex-col p-4 font-sans rounded-3xl shadow-2xl relative overflow-hidden">
      
      <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
        <div>
          <h2 className="text-xl font-bold capitalize">{roomDetails.title}</h2>
          <p className="text-xs text-purple-300 font-semibold">{isVideoRoom ? '🎥 Video Live Room' : '🎙️ Audio Live Room'}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-white/10 p-2 rounded-full hover:bg-white/20">🔗</button>
          <button className="bg-red-500/20 text-red-400 p-2 rounded-full hover:bg-red-500/40 text-xs font-bold px-3">Leave</button>
        </div>
      </div>

      <div className="w-full bg-black/40 rounded-2xl p-4 mb-4 flex flex-col items-center justify-center min-h-[260px] relative border border-white/5">
        
        {isVideoRoom ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            {activeYoutubeTrack ? (
              <div className="w-full aspect-video rounded-xl overflow-hidden shadow-inner">
                {React.createElement(ReactPlayer as any, {
                  url: activeYoutubeTrack,
                  playing: isPlaying,
                  controls: isHostOrAdmin,
                  width: '100%',
                  height: '100%',
                  onError: () => console.error('Failed to load video')
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center text-2xl mb-2 animate-pulse">📹</div>
                <p className="text-sm font-medium">Direct Host Video Stream</p>
                <p className="text-xs text-white/40 mt-1">Live camera active or stream video via URL below</p>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            {localAudioUrl && (
              <div className="hidden">
                <audio src={localAudioUrl} autoPlay controls={isHostOrAdmin} />
              </div>
            )}
            
            <p className="text-xs text-white/50 mb-3 bg-white/5 px-3 py-1 rounded-full">
              Active Mics: {participants.filter(p => p.isOnMic).length} / 10
            </p>

            <div className="grid grid-cols-5 gap-3 w-full justify-items-center mb-2">
              {Array.from({ length: 10 }).map((_, index) => {
                const speaker = participants.filter(p => p.isOnMic)[index];
                return (
                  <div key={index} className="flex flex-col items-center relative">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${speaker ? 'border-green-400 bg-purple-600' : 'border-dashed border-white/20 bg-white/5'}`}>
                      {speaker ? speaker.name.charAt(0) : index + 1}
                    </div>
                    {speaker?.isMuted && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-[10px] px-1 rounded-full">🔇</span>
                    )}
                    <span className="text-[10px] mt-1 truncate max-w-[50px] opacity-75">
                      {speaker ? speaker.name : 'Empty'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {isHostOrAdmin && (
        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 mb-4 text-xs">
          <p className="font-bold text-purple-300 mb-2">⚙️ Host Control Settings Panel</p>
          
          {isVideoRoom ? (
            <form onSubmit={handlePlayYoutube} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Paste YouTube Video URL here..." 
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-lg p-2 flex-1 text-white placeholder-white/30 outline-none"
              />
              <button type="submit" className="bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded-lg font-bold">Play</button>
            </form>
          ) : (
            <div className="flex flex-col gap-2">
              <label className="block text-white/60 mb-1">Play song from Local Storage:</label>
              <input 
                type="file" 
                accept="audio/*" 
                onChange={handleLocalAudioChange}
                className="block w-full text-xs text-white/50 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
              />
              {localAudioUrl && <p className="text-[10px] text-green-400">🎵 Local audio track loaded into background stream.</p>}
            </div>
          )}
        </div>
      )}

      <div className="flex-1 bg-black/20 rounded-2xl p-3 mb-4 overflow-y-auto flex flex-col justify-end min-h-[140px] max-h-[180px] border border-white/5">
        <div className="space-y-1 overflow-y-auto pr-1">
          {comments.map((comment, i) => (
            <p key={i} className="text-xs leading-relaxed bg-white/5 p-1.5 rounded-lg border border-white/5"><span className="text-purple-300 font-medium">💬</span> {comment}</p>
          ))}
        </div>
      </div>

      <form onSubmit={handleSendComment} className="flex gap-2 mb-4">
        <input 
          type="text" 
          placeholder="Say something..." 
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="bg-white/10 rounded-xl p-3 flex-1 text-xs text-white placeholder-white/40 outline-none focus:ring-1 focus:ring-purple-500"
        />
        <button type="submit" className="bg-pink-600 hover:bg-pink-700 p-3 rounded-xl transition-all text-xs font-bold px-4">Send</button>
      </form>

      <div className="w-full bg-black/30 rounded-2xl p-3 text-xs">
        <p className="font-bold text-white/60 mb-2 border-b border-white/5 pb-1">👥 Room Participants ({participants.length})</p>
        <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
          {participants.map((p) => (
            <div key={p.id} className="flex justify-between items-center bg-white/5 p-2 rounded-xl">
              <span className="font-medium">{p.name} {p.isOnMic && '🎙️'}</span>
              
              <div className="flex gap-1">
                {!isVideoRoom && (
                  <button 
                    onClick={() => toggleParticipantMic(p.id)}
                    className={`px-2 py-1 rounded text-[10px] font-bold ${p.isOnMic ? 'bg-green-600' : 'bg-white/10'}`}
                  >
                    {p.isOnMic ? 'On Stage' : 'Give Mic'}
                  </button>
                )}

                {isHostOrAdmin && (
                  <>
                    <button 
                      onClick={() => handleMuteUser(p.id)}
                      className="px-2 py-1 rounded text-[10px] font-bold bg-yellow-600 hover:bg-yellow-700"
                    >
                      {p.isMuted ? 'Unmute' : 'Mute'}
                    </button>
                    <button 
                      onClick={() => handleKickUser(p.id)}
                      className="px-2 py-1 rounded text-[10px] font-bold bg-red-600 hover:bg-red-700"
                    >
                      Kick
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}