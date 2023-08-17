export const splitIntoChunks = <T>(array: T[], chunkSize: number = 10) => {
  if (!array) {
    return [];
  }

  const chunks = [];

  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize);

    chunks.push(chunk);
  }

  return chunks;
};
