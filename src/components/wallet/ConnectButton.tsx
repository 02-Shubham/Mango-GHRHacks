'use client'

import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi'
import { Wallet, LogOut, ChevronDown, X, AlertCircle, ExternalLink } from 'lucide-react'
import { useState, useEffect } from 'react'
import { formatEther } from 'viem'
import { motion, AnimatePresence } from 'framer-motion'

export function ConnectButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending, error } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: balance } = useBalance({ address })
  const [mounted, setMounted] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleConnect = async (connector: any) => {
    try {
      await connect({ connector })
      setShowModal(false)
    } catch (err) {
      console.error('Connection error:', err)
    }
  }

  if (!mounted) {
    return (
      <button className="px-4 py-2 bg-bg-page border border-border-subtle rounded-xl animate-pulse text-text-muted text-sm">
        Loading...
      </button>
    )
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        {/* Wallet Info Chip */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-border-subtle shadow-sm">
          <div className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
          <span className="text-xs font-mono font-semibold text-text-main">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
          {balance && (
            <>
              <div className="w-px h-3.5 bg-border-subtle" />
              <span className="text-xs font-medium text-text-muted">
                {parseFloat(formatEther(balance.value)).toFixed(3)} {balance.symbol}
              </span>
            </>
          )}
        </div>

        {/* Disconnect Button */}
        <button
          onClick={() => disconnect()}
          className="p-2 hover:bg-red-50 rounded-xl transition-all border border-border-subtle group bg-white shadow-sm"
          title="Disconnect"
        >
          <LogOut className="w-4 h-4 text-text-muted group-hover:text-red-500 transition-colors" />
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Connect Button */}
      <button
        onClick={() => setShowModal(true)}
        disabled={isPending}
        className="px-5 py-2.5 bg-brand-primary hover:bg-brand-secondary text-white rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Wallet className="w-4 h-4" />
        {isPending ? 'Connecting...' : 'Connect Wallet'}
      </button>

      {/* Wallet Selection Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
            >
              <div className="bg-white border border-border-subtle rounded-2xl p-8 shadow-2xl mx-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-primary/10 rounded-xl">
                      <Wallet className="w-5 h-5 text-brand-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-text-main">Connect Wallet</h3>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-bg-page rounded-xl transition-colors text-text-muted hover:text-text-main"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{error.message}</p>
                  </div>
                )}

                {/* Wallet Options */}
                <div className="space-y-3">
                  {connectors.map((connector) => {
                    const isMetaMask = connector.name.toLowerCase().includes('metamask')
                    const isInjected = connector.id === 'injected'

                    return (
                      <button
                        key={connector.id}
                        onClick={() => handleConnect(connector)}
                        disabled={isPending}
                        className="w-full flex items-center gap-4 p-4 bg-bg-page hover:bg-brand-primary/5 border border-border-subtle hover:border-brand-primary/30 rounded-2xl transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {/* Wallet Icon */}
                        <div className="w-11 h-11 rounded-xl bg-white border border-border-subtle flex items-center justify-center group-hover:border-brand-primary/30 group-hover:shadow-sm transition-all">
                          {isMetaMask ? (
                            <svg className="w-6 h-6" viewBox="0 0 40 40" fill="none">
                              <path d="M36.5 3.5L22 14.5L24.5 8.5L36.5 3.5Z" fill="#E17726" stroke="#E17726" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M3.5 3.5L17.5 14.5L15 8.5L3.5 3.5Z" fill="#E27625" stroke="#E27625" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M31 27.5L27.5 33.5L35.5 35.5L37.5 27.5H31Z" fill="#E27625" stroke="#E27625" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M2.5 27.5L4.5 35.5L12.5 33.5L9 27.5H2.5Z" fill="#E27625" stroke="#E27625" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M12 17.5L10 21L18 21.5L17.5 13L12 17.5Z" fill="#E27625" stroke="#E27625" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M28 17.5L22.5 13L22 21.5L30 21L28 17.5Z" fill="#E27625" stroke="#E27625" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M12.5 33.5L17 31.5L13 27.5L12.5 33.5Z" fill="#E27625" stroke="#E27625" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M23 31.5L27.5 33.5L27 27.5L23 31.5Z" fill="#E27625" stroke="#E27625" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : (
                            <Wallet className="w-5 h-5 text-text-muted group-hover:text-brand-primary transition-colors" />
                          )}
                        </div>

                        {/* Wallet Info */}
                        <div className="flex-1 text-left">
                          <div className="text-sm font-semibold text-text-main group-hover:text-brand-primary transition-colors">
                            {connector.name}
                          </div>
                          <div className="text-xs text-text-muted">
                            {isMetaMask ? 'Popular' : isInjected ? 'Browser Wallet' : 'Connect'}
                          </div>
                        </div>

                        {/* Arrow */}
                        <ChevronDown className="w-4 h-4 text-text-muted -rotate-90 group-hover:text-brand-primary transition-colors" />
                      </button>
                    )
                  })}
                </div>

                {/* No MetaMask Warning */}
                {connectors.length === 0 && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-700">
                      <p className="font-medium mb-1">No wallet detected</p>
                      <p>Please install MetaMask or another Web3 wallet to continue.</p>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="mt-8 pt-5 border-t border-border-subtle">
                  <p className="text-xs text-text-muted text-center">
                    By connecting, you agree to our Terms of Service
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
