import { Camera, CameraOff, Mic, MicOff, MonitorUp, Video } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { useRealtimeKitClient } from '@cloudflare/realtimekit-react';
import {
  RtkCameraToggle,
  RtkMicToggle,
  RtkScreenShareToggle,
  RtkSimpleGrid,
  RtkUiProvider,
} from '@cloudflare/realtimekit-react-ui';

export function TradeoffMedia({ authToken, meetingId }: { authToken: string; meetingId: string }) {
  const [meeting, initMeeting] = useRealtimeKitClient();
  const [error, setError] = useState('');
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const meetingRef = useRef<typeof meeting>(undefined);

  useEffect(() => {
    let active = true;
    void initMeeting({
      authToken,
      defaults: { audio: false, video: false },
    })
      .then((client) => {
        if (active) meetingRef.current = client;
      })
      .catch((reason) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Could not join media');
      });
    return () => {
      active = false;
      void meetingRef.current?.leave();
    };
    // The match-scoped token is stable for the component lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken, meetingId]);

  if (error) {
    return <MediaUnavailable reason={error} />;
  }

  if (!meeting) {
    return (
      <div className="flex min-h-36 items-center justify-center text-xs text-white/40">
        Connecting media…
      </div>
    );
  }

  async function joinRoom() {
    if (!meeting || joining) return;
    setJoining(true);
    setError('');
    try {
      if (micOn) await meeting.self.enableAudio();
      if (cameraOn) await meeting.self.enableVideo();
      await meeting.join();
      setJoined(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not join media');
    } finally {
      setJoining(false);
    }
  }

  if (!joined) {
    return (
      <div className="rounded-lg border border-white/10 bg-black/40 p-4">
        <p className="text-xs font-medium text-white">Device setup</p>
        <p className="mt-1 text-[11px] leading-5 text-white/40">
          Join muted by default. Enable only the devices you want to publish.
        </p>
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMicOn((value) => !value)}
            aria-pressed={micOn}
            className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md border text-xs ${micOn ? 'border-sky-300/40 text-sky-200' : 'border-white/10 text-white/50'}`}
          >
            {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            {micOn ? 'Mic on' : 'Muted'}
          </button>
          <button
            type="button"
            onClick={() => setCameraOn((value) => !value)}
            aria-pressed={cameraOn}
            className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md border text-xs ${cameraOn ? 'border-sky-300/40 text-sky-200' : 'border-white/10 text-white/50'}`}
          >
            {cameraOn ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
            {cameraOn ? 'Camera on' : 'Camera off'}
          </button>
        </div>
        <button
          type="button"
          onClick={() => void joinRoom()}
          disabled={joining}
          className="mt-3 min-h-11 w-full rounded-md bg-white text-xs font-medium text-black disabled:opacity-50"
        >
          {joining ? 'Joining…' : 'Join video room'}
        </button>
      </div>
    );
  }

  return (
    <RtkUiProvider meeting={meeting}>
      <div className="overflow-hidden rounded-lg bg-[#080808]">
        <div className="h-40 [&_rtk-simple-grid]:h-full [&_rtk-simple-grid]:bg-black">
          <RtkSimpleGrid />
        </div>
        <div className="flex min-h-12 items-center justify-center gap-2 border-t border-white/10 bg-black px-3">
          <RtkMicToggle aria-label="Mute or unmute microphone" />
          <RtkCameraToggle aria-label="Turn camera on or off" />
          <RtkScreenShareToggle aria-label="Start or stop screen sharing" />
        </div>
      </div>
    </RtkUiProvider>
  );
}

export function MediaUnavailable({ reason }: { reason: string }) {
  const [mic, setMic] = useState(false);
  const [camera, setCamera] = useState(false);
  return (
    <div>
      <div className="grid min-h-36 place-items-center rounded-lg border border-dashed border-white/10 bg-black/40 px-4 text-center">
        <div>
          <Video className="mx-auto h-5 w-5 text-white/25" />
          <p className="mt-3 text-xs text-white/45">{reason}</p>
          <p className="mt-1 font-mono text-[10px] text-white/25">
            Artifacts and phase sync still work.
          </p>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setMic((value) => !value)}
          aria-label={mic ? 'Mute microphone' : 'Unmute microphone'}
          className="flex h-11 w-11 items-center justify-center rounded-md border border-white/10 text-white/50 hover:border-white/20 hover:text-white"
        >
          {mic ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={() => setCamera((value) => !value)}
          aria-label={camera ? 'Turn camera off' : 'Turn camera on'}
          className="flex h-11 w-11 items-center justify-center rounded-md border border-white/10 text-white/50 hover:border-white/20 hover:text-white"
        >
          {camera ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
        </button>
        <button
          type="button"
          disabled
          aria-label="Screen sharing unavailable"
          className="flex h-11 w-11 items-center justify-center rounded-md border border-white/10 text-white/20"
        >
          <MonitorUp className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
