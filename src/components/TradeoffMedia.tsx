import { Camera, CameraOff, Mic, MicOff, MonitorUp, Video } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

import type { RTKParticipant, RTKSelf } from '@cloudflare/realtimekit';
import {
  RealtimeKitProvider,
  useRealtimeKitClient,
  useRealtimeKitSelector,
} from '@cloudflare/realtimekit-react';

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
    <RealtimeKitProvider value={meeting}>
      <JoinedMedia />
    </RealtimeKitProvider>
  );
}

function JoinedMedia() {
  const self = useRealtimeKitSelector((client) => client.self);
  const participants = useRealtimeKitSelector((client) => client.participants.active.toArray());
  const [controlError, setControlError] = useState('');
  const [controlPending, setControlPending] = useState(false);

  async function updateMedia(action: () => Promise<void>) {
    if (controlPending) return;
    setControlPending(true);
    setControlError('');
    try {
      await action();
    } catch (reason) {
      setControlError(reason instanceof Error ? reason.message : 'Could not update media');
    } finally {
      setControlPending(false);
    }
  }

  const tiles: Array<{ participant: RTKParticipant | RTKSelf; isSelf: boolean }> = [
    { participant: self, isSelf: true },
    ...participants.map((participant) => ({ participant, isSelf: false })),
  ];

  return (
    <div className="overflow-hidden rounded-lg bg-[#080808]">
      <div className="grid min-h-40 grid-cols-1 gap-px bg-white/10 sm:grid-cols-2">
        {tiles.map(({ participant, isSelf }) => (
          <ParticipantTile
            key={isSelf ? 'self' : participant.id}
            participant={participant}
            isSelf={isSelf}
          />
        ))}
        {tiles
          .filter(({ participant }) => participant.screenShareEnabled)
          .map(({ participant, isSelf }) => (
            <ScreenShareTile
              key={`screen-${isSelf ? 'self' : participant.id}`}
              participant={participant}
              isSelf={isSelf}
            />
          ))}
      </div>
      <div className="flex min-h-14 flex-wrap items-center justify-center gap-2 border-t border-white/10 bg-black px-3 py-2">
        <MediaControl
          label={self.audioEnabled ? 'Mute microphone' : 'Unmute microphone'}
          active={self.audioEnabled}
          disabled={controlPending}
          onClick={() =>
            void updateMedia(() => (self.audioEnabled ? self.disableAudio() : self.enableAudio()))
          }
          activeIcon={<Mic className="h-4 w-4" />}
          inactiveIcon={<MicOff className="h-4 w-4" />}
        />
        <MediaControl
          label={self.videoEnabled ? 'Turn camera off' : 'Turn camera on'}
          active={self.videoEnabled}
          disabled={controlPending}
          onClick={() =>
            void updateMedia(() => (self.videoEnabled ? self.disableVideo() : self.enableVideo()))
          }
          activeIcon={<Camera className="h-4 w-4" />}
          inactiveIcon={<CameraOff className="h-4 w-4" />}
        />
        <MediaControl
          label={self.screenShareEnabled ? 'Stop screen sharing' : 'Share screen'}
          active={self.screenShareEnabled}
          disabled={controlPending}
          onClick={() =>
            void updateMedia(() =>
              self.screenShareEnabled ? self.disableScreenShare() : self.enableScreenShare()
            )
          }
          activeIcon={<MonitorUp className="h-4 w-4" />}
          inactiveIcon={<MonitorUp className="h-4 w-4" />}
        />
        {controlError ? (
          <p role="alert" className="w-full text-center text-[11px] text-rose-300">
            {controlError}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function ParticipantTile({
  participant,
  isSelf,
}: {
  participant: RTKParticipant | RTKSelf;
  isSelf: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    participant.registerVideoElement(video);
    return () => participant.deregisterVideoElement(video);
  }, [participant]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || isSelf) return;
    audio.srcObject = participant.audioEnabled ? new MediaStream([participant.audioTrack]) : null;
    return () => {
      audio.srcObject = null;
    };
  }, [isSelf, participant, participant.audioEnabled, participant.audioTrack]);

  return (
    <div className="relative grid min-h-40 place-items-center overflow-hidden bg-black">
      <video
        ref={videoRef}
        autoPlay
        muted={isSelf}
        playsInline
        className={`h-full w-full object-cover ${participant.videoEnabled ? 'block' : 'hidden'}`}
      />
      {/* biome-ignore lint/a11y/useMediaCaption: live call audio has no prerecorded caption track */}
      {!isSelf ? <audio ref={audioRef} autoPlay /> : null}
      {!participant.videoEnabled ? (
        <div className="grid h-12 w-12 place-items-center rounded-full bg-white/10 text-sm font-medium text-white/70">
          {participant.name?.trim().charAt(0).toUpperCase() || '?'}
        </div>
      ) : null}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent px-3 pb-2 pt-6 text-[11px] text-white/70">
        <span>{isSelf ? 'You' : participant.name || 'Opponent'}</span>
        {participant.audioEnabled ? (
          <Mic className="h-3.5 w-3.5" aria-label="Microphone on" />
        ) : (
          <MicOff className="h-3.5 w-3.5 text-white/40" aria-label="Microphone muted" />
        )}
      </div>
    </div>
  );
}

function ScreenShareTile({
  participant,
  isSelf,
}: {
  participant: RTKParticipant | RTKSelf;
  isSelf: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const track = participant.screenShareTracks.video;
    if (!video || !track) return;
    video.srcObject = new MediaStream([track]);
    return () => {
      video.srcObject = null;
    };
  }, [participant, participant.screenShareTracks.video]);

  return (
    <div className="relative min-h-40 overflow-hidden bg-black">
      <video
        ref={videoRef}
        autoPlay
        muted={isSelf}
        playsInline
        className="h-full w-full object-contain"
      />
      <span className="absolute bottom-2 left-3 rounded bg-black/70 px-2 py-1 text-[10px] text-white/70">
        {isSelf ? 'Your screen' : `${participant.name || 'Opponent'}’s screen`}
      </span>
    </div>
  );
}

function MediaControl({
  label,
  active,
  disabled,
  onClick,
  activeIcon,
  inactiveIcon,
}: {
  label: string;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  activeIcon: ReactNode;
  inactiveIcon: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-11 w-11 items-center justify-center rounded-md border transition-colors disabled:opacity-40 ${
        active
          ? 'border-sky-300/40 bg-sky-300/10 text-sky-200'
          : 'border-white/10 text-white/45 hover:border-white/20 hover:text-white'
      }`}
    >
      {active ? activeIcon : inactiveIcon}
    </button>
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
