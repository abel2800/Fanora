import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

const Dropdown = ({
  trigger,
  children,
  placement = 'bottom-end',
  className
}) => {
  const placements = {
    'bottom-start': 'origin-top-left left-0',
    'bottom-end': 'origin-top-right right-0',
    'top-start': 'origin-bottom-left left-0 bottom-full mb-2',
    'top-end': 'origin-bottom-right right-0 bottom-full mb-2',
  }

  return (
    <Menu as="div" className={clsx('relative inline-block text-left', className)}>
      <Menu.Button as={Fragment}>
        {trigger}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={clsx(
            'absolute z-50 mt-2 w-56 rounded-lg bg-charcoal-800 shadow-lg ring-1 ring-charcoal-700 ring-opacity-100 focus:outline-none',
            placements[placement]
          )}
        >
          <div className="py-1">
            {children}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}

const DropdownItem = ({
  children,
  onClick,
  disabled = false,
  className,
  ...props
}) => (
  <Menu.Item disabled={disabled}>
    {({ active }) => (
      <button
        onClick={onClick}
        className={clsx(
          'group flex w-full items-center px-4 py-2 text-sm transition-colors',
          active ? 'bg-charcoal-700 text-primary-400' : 'text-gray-300 hover:text-gray-100',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...props}
      >
        {children}
      </button>
    )}
  </Menu.Item>
)

const DropdownDivider = () => (
  <div className="border-t border-charcoal-700 my-1" />
)

const DropdownHeader = ({ children, className }) => (
  <div className={clsx('px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide', className)}>
    {children}
  </div>
)

export { Dropdown, DropdownItem, DropdownDivider, DropdownHeader }
