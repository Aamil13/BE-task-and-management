import logger from './logger';

export const sendEmail = async (to: string, subject: string, _message: string): Promise<void> => {
  try {
    logger.info({ to, subject }, 'Email sent (placeholder implementation)');
  } catch (error) {
    logger.error(error, 'Email sending failed');
    throw error;
  }
};
