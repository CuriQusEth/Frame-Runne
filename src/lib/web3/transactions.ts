import { writeContract } from 'wagmi/actions';
import { config } from './config';
import { parseAbi } from 'viem';

// The address specified in the prompt
const TARGET_ADDRESS = '0xcD0dd3716C5561De47a24949335dF8a8CD8F71a3';

const abi = parseAbi([
  'function sayGM() external',
]);

export async function sendGMTransaction() {
  try {
    const hash = await writeContract(config, {
      address: TARGET_ADDRESS,
      abi,
      functionName: 'sayGM',
    });
    console.log('Transaction sent:', hash);
    return hash;
  } catch (error) {
    console.error('Error sending GM transaction:', error);
    throw error;
  }
}
