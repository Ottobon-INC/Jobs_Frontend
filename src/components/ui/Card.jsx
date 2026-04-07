import clsx from 'clsx';

const Card = ({ children, className, hover = false, ...props }) => {
    return (
        <div
            className={clsx(
                'bg-white rounded-[32px] border border-zinc-100 premium-shadow',
                'p-8 relative overflow-hidden transition-all duration-500 ease-out',
                hover && 'hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)] cursor-pointer',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
