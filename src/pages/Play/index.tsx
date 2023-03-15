import { useCallback, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useWallet } from 'contexts/WalletProvider';
import { useUnityContext } from 'contexts/UnityProvider';
import Unity, { UnityEventListener } from 'components/unity/Unity';
import * as indexer from 'services/indexer';

const Play = () => {
  const { address } = useWallet();
  const { unityContext } = useUnityContext();
  const { isLoaded, sendMessage } = unityContext;

  useEffect(() => {
    if (address) {
      toast.success('Wallet Connected');
    }
  }, [address]);

  useEffect(() => {
    (async () => {
      if (isLoaded && address) {
        console.log('[Web] Send Wallet Address to Unity', address);
        // Send wallet connected state.
        sendMessage('GFT', 'WalletConnected', address);

        const token = await indexer.getEntryCoin(address);
        const entryCoinAmount = token ? token.value : 0;
        console.log('[Web] Send entryCoinAmount to Unity', entryCoinAmount);
        sendMessage('GFT', 'EntryTokensOnConnect', entryCoinAmount);
      }
    })();
  }, [isLoaded, sendMessage, address]);

  const onSyncWallet = useCallback(() => {
    sendMessage('GFT', 'WalletAddress', address);
  }, [sendMessage, address]);

  const onMint = useCallback(
    async (params) => {
      console.log('Mint', params);
      if (address) {
        const data = JSON.parse(params);
        console.log('Mint-Json', data);
        const items = data.items;
        console.log('Mint-items', items);

        const value = (key) => items.find((i) => i.name === key)?.value ?? 0;

        const payload = {
          induction_time: value('induction_time'),
          kairos: value('kairos'),
          cave: value('cave'),
          manifold: value('manifold'),
          perception: value('perception'),
          perception_time: value('perception_time'),
          falling_chamber: value('falling_chamber'),
          minter: address,
        };
        const result = await indexer.mint(payload);
        console.log('Mint-Result', result);

        const token = await indexer.getEntryCoin(address);
        const entryCoinAmount = token ? token.value : 0;
        sendMessage('GFT', 'MintComplete', entryCoinAmount);

        await indexer.updateEntryCoinAmount(address, entryCoinAmount - 1);
        sendMessage('GFT', 'MintComplete', entryCoinAmount - 1);
      }
    },
    [address, sendMessage]
  );

  const eventListeners = useMemo((): UnityEventListener[] => {
    return [
      { eventName: 'onSyncWallet', callback: onSyncWallet },
      { eventName: 'SendMint', callback: onMint },
    ];
  }, [onSyncWallet, onMint]);

  // const handleMint = useCallback(async () => {
  //   console.log('HandleMint, address=', address);
  //   if (address) {
  //     const payload = {
  //       induction_time: 1,
  //       kairos: 2,
  //       cave: 3,
  //       manifold: 4,
  //       perception: 5,
  //       perception_time: 6,
  //       falling_chamber: 3,
  //       minter: address,
  //     };
  //     const result = await indexer.mint(payload);
  //     console.log('Mint-Result', result);

  //     const token = await indexer.getEntryCoin(address);
  //     const entryCoinAmount = token ? token.value : 0;
  //     sendMessage('GFT', 'MintComplete', entryCoinAmount);
  //     await indexer.updateEntryCoinAmount(address, entryCoinAmount - 1);
  //     sendMessage('GFT', 'MintComplete', entryCoinAmount - 1);
  //   }
  // }, [address, sendMessage]);

  return (
    <div className="container mx-auto mt-4">
      <Unity
        unityContext={unityContext}
        eventListeners={eventListeners}
        styles={{
          height: 540,
          width: 950,
          background: '#555',
        }}
      ></Unity>
      {/* <div className="flex flex-row justify-center w-full mt-4">
        <button
          className="block px-6 py-2.5 mt-4 font-medium leading-5 text-center text-white capitalize bg-blue-600 rounded-lg lg:mt-0 hover:bg-blue-500 lg:w-auto"
          onClick={handleMint}
          disabled={!address}
        >
          Mint
        </button>
      </div> */}
    </div>
  );
};

export default Play;
