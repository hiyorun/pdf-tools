export function touchActions(node: HTMLButtonElement, threshold = 500) {
    // note — a complete answer would also consider touch events

    let timer: number | null = null

    const onLongTouch = () => {
        if (timer) {
            clearTimeout(timer)
            timer = null
            node.dispatchEvent(new CustomEvent('touch:long'))
            destroy()
        }
        node.addEventListener('touchend', handleLongTouchEnd)
    }

    const handleTouchStart = (e: Event) => {
        console.log("handleTouchStart")
        if (!timer) {
            timer = setTimeout(function () {
                e.preventDefault()
                onLongTouch();
            }, threshold);
        }
        node.dispatchEvent(new CustomEvent('touch:start'))
    }

    const handleTouchMove = (e: Event) => {
        console.log("handleTouchMove")
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        node.dispatchEvent(new CustomEvent('touch:move'))
    }

    const handleTouchEnd = (e: Event) => {
        console.log("handleTouchEnd")
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        node.dispatchEvent(new CustomEvent('touch:end'))
    }

    const handleLongTouchEnd = (e: Event) => {
        console.log("handleLongTouchEnd")
        create()
    }

    const create = () => {
        node.removeEventListener('touchend', handleLongTouchEnd)
        node.addEventListener('touchstart', handleTouchStart)
        node.addEventListener('touchmove', handleTouchMove)
        node.addEventListener('touchend', handleTouchEnd)
    }

    const destroy = () => {
        node.removeEventListener('touchstart', handleTouchEnd);
        node.removeEventListener('touchmove', handleTouchMove)
        node.removeEventListener('touchend', handleTouchEnd)
    }

    create()

    return {
        destroy
    };
}
