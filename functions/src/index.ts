import { onCall } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

export const checkOverdueTasks = onCall(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new Error('A requisição deve ser autenticada e possuir um token válido. Faça login novamente.');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const tasksSnapshot = await db.collection('tasks')
      .where('userId', '==', userId)
      .where('completed', '==', false)
      .get();

    const overdueTasks: any[] = [];
    const nearingDueTasks: any[] = [];

    tasksSnapshot.docs.forEach(doc => {
      const task = doc.data() as { title: string; dueDate: admin.firestore.Timestamp };
      const taskId = doc.id;

      if (task.dueDate && typeof task.dueDate.toDate === 'function') {
        const dueDate = task.dueDate.toDate();
        dueDate.setHours(0, 0, 0, 0);

        if (dueDate.getTime() < today.getTime()) {
          overdueTasks.push({
            id: taskId,
            title: task.title,
            dueDate: dueDate.toISOString().split('T')[0],
          });
        } else {
          const threeDaysFromNow = new Date(today);
          threeDaysFromNow.setDate(today.getDate() + 3);
          if (dueDate.getTime() <= threeDaysFromNow.getTime()) {
            nearingDueTasks.push({
              id: taskId,
              title: task.title,
              dueDate: dueDate.toISOString().split('T')[0],
            });
          }
        }
      }
    });

    return {
      message: 'Verificação de tarefas concluída.',
      overdueCount: overdueTasks.length,
      nearingDueCount: nearingDueTasks.length,
      overdueTasks,
      nearingDueTasks,
    };

  } catch (error) {
    console.error('Erro ao verificar tarefas vencidas:', error);
    throw new Error('Ocorreu um erro interno ao verificar as tarefas.');
  }
});
