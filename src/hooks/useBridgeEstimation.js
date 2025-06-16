import { useState, useEffect } from 'react';

const useBridgeEstimation = (sourceChain, targetChain, amount) => {
  const [estimation, setEstimation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sourceChain || !targetChain || !amount) {
      setEstimation(null);
      return;
    }

    const fetchEstimation = async () => {
      setLoading(true);
      setError(null);
      try {
        // Simulate API call for bridge estimation
        // In a real application, this would call a backend API or a bridge SDK
        const response = await new Promise(resolve => setTimeout(() => {
          const estimatedFee = amount * 0.001; // 0.1% fee
          const estimatedTime = Math.random() * 60 + 30; // 30-90 seconds
          resolve({
            estimatedAmount: amount - estimatedFee,
            estimatedFee: estimatedFee,
            estimatedTime: Math.round(estimatedTime)
          });
        }, 1000));
        setEstimation(response);
      } catch (err) {
        setError('Failed to fetch bridge estimation.');
        console.error('Error fetching bridge estimation:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEstimation();
  }, [sourceChain, targetChain, amount]);

  return { estimation, loading, error };
};

export default useBridgeEstimation;

