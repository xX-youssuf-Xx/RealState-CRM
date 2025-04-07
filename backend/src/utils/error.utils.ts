export const handleError = (res: any, error: any, message = 'Something went wrong') => {
    console.error(message + ':', error);
    return res.status(500).json({ message });
  };