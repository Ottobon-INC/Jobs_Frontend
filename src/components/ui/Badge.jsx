import clsx from 'clsx';

const Badge = ({ children, variant = 'default', className, ...props }) => {
    const variants = {
        default: 'bg-zinc-100 text-zinc-500 border-none',
        accent: 'bg-black text-white shadow-xl shadow-black/5',
        success: 'bg-emerald-50 text-emerald-600',
        warning: 'bg-amber-50 text-amber-600',
        danger: 'bg-rose-50 text-rose-600',
    };

    return (
        <span
            className={clsx(
                'inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider leading-none uppercase',
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
