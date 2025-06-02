
// src/app/actions/queueActions.ts
'use server';

import { firestore } from '@/lib/firebase-admin'; // Firestore Admin SDK
import type { Queue, KanbanColumnConfig } from '@/types';
import type { QueueFormData } from '@/components/admin/queue-form-dialog'; // Assuming schema matches
import {FieldValue} from 'firebase-admin/firestore';


export async function getQueuesFromFirestoreServerAction(): Promise<Queue[]> {
  if (!firestore) {
    console.error("Firestore Admin SDK not initialized. Cannot fetch queues.");
    // Retornar um array vazio ou lançar um erro mais específico
    // pode ser melhor dependendo de como você quer lidar com isso na UI.
    return []; 
  }
  try {
    const queuesCollection = firestore.collection('queues');
    const snapshot = await queuesCollection.where('isActive', '==', true).orderBy('name').get();
    
    if (snapshot.empty) {
      return [];
    }
    
    const queues: Queue[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || '',
        description: data.description || '',
        isActive: data.isActive === undefined ? true : data.isActive, // Default to true if undefined
        kanbanColumns: data.kanbanColumns || [],
        defaultAiAgentId: data.defaultAiAgentId || undefined,
      } as Queue;
    });
    return queues;
  } catch (error) {
    console.error("Error fetching queues from Firestore:", error);
    // Considere um tratamento de erro mais robusto ou logging
    return []; // Retorna vazio em caso de erro para não quebrar a UI completamente
  }
}

const defaultMappedStatuses: ChatStatusColumn[][] = [
  ['WAITING'],
  ['IN_PROGRESS'],
  ['TRANSFERRED'],
];

const processKanbanColumnNamesForFirestore = (namesString?: string): KanbanColumnConfig[] => {
    if (!namesString || namesString.trim() === '') {
      return [
        { id: `col_default_1_${Date.now()}`, title: 'Aguardando', mappedStatuses: ['WAITING'] },
        { id: `col_default_2_${Date.now()}`, title: 'Em Progresso', mappedStatuses: ['IN_PROGRESS'] },
        { id: `col_default_3_${Date.now()}`, title: 'Transferido', mappedStatuses: ['TRANSFERRED'] },
      ];
    }
    const namesArray = namesString.split('\\n').map(name => name.trim()).filter(name => name !== '');
    return namesArray.map((name, index) => ({
      id: `col_${index}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: name,
      mappedStatuses: index < defaultMappedStatuses.length ? defaultMappedStatuses[index] : [],
    }));
  };


export async function saveQueueToFirestoreServerAction(
  queueData: QueueFormData,
  queueId?: string
): Promise<Queue | null> {
  if (!firestore) {
    console.error("Firestore Admin SDK not initialized. Cannot save queue.");
    return null;
  }

  try {
    const processedKanbanColumns = processKanbanColumnNamesForFirestore(queueData.kanbanColumnNames);
    
    const dataToSave = {
      name: queueData.name,
      description: queueData.description || '',
      isActive: queueData.isActive,
      kanbanColumns: processedKanbanColumns,
      defaultAiAgentId: queueData.defaultAiAgentId || FieldValue.delete(), // Use FieldValue.delete() to remove the field if undefined
    };

    if (queueId) {
      // Update existing queue
      const queueRef = firestore.collection('queues').doc(queueId);
      await queueRef.update(dataToSave);
      console.log(`Queue ${queueId} updated in Firestore.`);
      const updatedDoc = await queueRef.get();
      const updatedData = updatedDoc.data();
      return { 
        id: updatedDoc.id, 
        ...updatedData 
      } as Queue;
    } else {
      // Create new queue
      const newQueueRef = await firestore.collection('queues').add(dataToSave);
      console.log(`New queue created with ID: ${newQueueRef.id} in Firestore.`);
      const newDoc = await newQueueRef.get();
      const newData = newDoc.data();
      return { 
        id: newDoc.id,
        ...newData
      } as Queue;
    }
  } catch (error) {
    console.error("Error saving queue to Firestore:", error);
    return null;
  }
}

export async function deleteQueueFromFirestoreServerAction(queueId: string): Promise<boolean> {
  if (!firestore) {
    console.error("Firestore Admin SDK not initialized. Cannot delete queue.");
    return false;
  }
  try {
    await firestore.collection('queues').doc(queueId).delete();
    console.log(`Queue ${queueId} deleted from Firestore.`);
    return true;
  } catch (error) {
    console.error(`Error deleting queue ${queueId} from Firestore:`, error);
    return false;
  }
}
