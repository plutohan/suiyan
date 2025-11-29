import { FC } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";

const WalletView: FC = () => {
  const account = useCurrentAccount();

  return (
    <>
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Wallet Info</h1>
      </div>
      <div className="flex flex-col items-center gap-6">
        <div className="w-full max-w-5xl">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Connected Wallet</h3>
            {account?.address ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Address:
                  </p>
                  <code className="block text-sm bg-gray-100 dark:bg-gray-900 p-3 rounded break-all font-mono">
                    {account.address}
                  </code>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                No wallet connected. Please connect your wallet using the button in the navbar.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default WalletView;
