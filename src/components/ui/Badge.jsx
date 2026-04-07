import clsx from 'clsx';

const Badge = ({ children, variant = 'default', className, ...props }) => {
    const variants = {
        default: 'bg-zinc-100/80 text-zinc-600 border border-zinc-200/50',
        accent: 'bg-zinc-900 text-white shadow-lg shadow-zinc-900/10',
        success: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
        warning: 'bg-amber-50 text-amber-600 border border-amber-100',
        danger: 'bg-rose-50 text-rose-600 border border-rose-100 shadow-sm',
    };

    return (
        <span
            className={clsx(
                'inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-semibold tracking-tight leading-none',
                variants[variant] || variants.default,
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
};

export default Badge;
