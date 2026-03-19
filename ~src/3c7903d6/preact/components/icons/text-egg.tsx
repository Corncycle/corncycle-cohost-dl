import React, { FunctionComponent, forwardRef } from "react";

export const NestedEgg = forwardRef<
    SVGSVGElement,
    React.PropsWithChildren<React.SVGAttributes<SVGElement>>
>(({ children, ...props }, ref) => (
    <svg
        viewBox="0 0 25 18"
        xmlns="http://www.w3.org/2000/svg"
        style={{
            fillRule: "evenodd",
            clipRule: "evenodd",
            strokeLinejoin: "round",
            strokeMiterlimit: 2,
        }}
        {...props}
        ref={ref}
        role="button"
    >
        <path
            d="M14.923 17.087c-2.254.666-4.388.967-6.402.905-2.014-.062-3.742-.532-5.183-1.409-1.442-.877-2.436-2.217-2.982-4.022-.549-1.814-.463-3.476.257-4.985.719-1.51 1.905-2.832 3.557-3.965C5.823 2.478 7.776 1.578 10.03.913c2.243-.663 4.369-.965 6.376-.906 2.007.059 3.733.523 5.178 1.394 1.446.87 2.441 2.207 2.987 4.011.546 1.804.457 3.464-.266 4.981-.724 1.516-1.908 2.845-3.551 3.987-1.644 1.143-3.588 2.045-5.831 2.707Z"
            style={{
                fillRule: "nonzero",
            }}
        />
        {children}
    </svg>
));
NestedEgg.displayName = "NestedEgg";

export const IconEgg = forwardRef<
    SVGSVGElement,
    React.PropsWithChildren<
        React.SVGAttributes<SVGElement> & { scale?: number; rotation?: number }
    >
>(({ children, scale = 0.8, rotation = 0, ...props }, ref) => (
    <NestedEgg {...props} ref={ref}>
        <g
            transform-origin="center center"
            transform={`scale(${scale} ${scale}) rotate(${rotation})`}
        >
            {children}
        </g>
    </NestedEgg>
));
IconEgg.displayName = "IconEgg";

export const TextEgg = forwardRef<
    SVGSVGElement,
    React.PropsWithChildren<React.SVGAttributes<SVGElement>>
>(({ children, ...props }, ref) => (
    <NestedEgg {...props} ref={ref}>
        <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="cursor-pointer select-none fill-current font-atkinson text-[10px] font-bold leading-none"
        >
            {children}
        </text>
    </NestedEgg>
));
TextEgg.displayName = "TextEgg";
