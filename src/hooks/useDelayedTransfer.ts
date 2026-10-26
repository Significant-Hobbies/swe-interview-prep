import { useEffect, useState } from 'react';

import { useAuth } from '../contexts/AuthContext';
import {
  parseDelayedTransferEvents,
  parseDelayedTransferInterventions,
  type DelayedTransferEvent,
  type DelayedTransferIntervention,
} from '../lib/delayedTransfer';
import { learningFetch } from '../lib/learningApi';

export function useDelayedTransfer() {
  const { user } = useAuth();
  const [events, setEvents] = useState<DelayedTransferEvent[]>([]);
  const [interventions, setInterventions] = useState<DelayedTransferIntervention[]>([]);
  const [loading, setLoading] = useState(Boolean(user));
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    if (!user) {
      setEvents([]);
      setInterventions([]);
      setLoading(false);
      setAvailable(true);
      return;
    }

    let active = true;
    setLoading(true);
    void Promise.all([
      learningFetch('activity', { query: 'days=365&kind=delayed_transfer' }),
      learningFetch('activity', { query: 'days=365&kind=feynman' }),
    ])
      .then(async ([eventResponse, interventionResponse]) => {
        if (!eventResponse?.ok || !interventionResponse?.ok) {
          throw new Error('Could not read delayed-transfer history.');
        }
        const [eventData, interventionData] = await Promise.all([
          eventResponse.json(),
          interventionResponse.json(),
        ]);
        if (active) {
          setEvents(parseDelayedTransferEvents(eventData.activity));
          setInterventions(parseDelayedTransferInterventions(interventionData.activity));
          setAvailable(true);
        }
      })
      .catch(() => {
        if (active) setAvailable(false);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  return { events, interventions, loading, available };
}
