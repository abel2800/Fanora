import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

export function BottomSheet({ isOpen, onClose, title, children }) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-220"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-x-0 bottom-0 flex max-h-[90vh]">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-out duration-220"
                enterFrom="translate-y-full"
                enterTo="translate-y-0"
                leave="transform transition ease-in duration-200"
                leaveFrom="translate-y-0"
                leaveTo="translate-y-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen">
                  <div className="flex max-h-[90vh] flex-col rounded-t-sheet border border-charcoal-700 bg-charcoal-900 shadow-2xl">
                    <div className="mx-auto mt-3 h-1.5 w-12 rounded-pill bg-charcoal-700" />
                    <div className="flex items-center justify-between px-6 py-4 border-b border-charcoal-700">
                      <Dialog.Title className="text-lg font-display font-semibold text-gray-100">
                        {title}
                      </Dialog.Title>
                      <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>
                    <div className="overflow-y-auto px-6 py-6">{children}</div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
