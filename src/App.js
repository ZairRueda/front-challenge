import React, { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";

const App = () => {
    const [moveableComponents, setMoveableComponents] = useState([]);
    const [selected, setSelected] = useState(null);

    const addMoveable = async () => {
        // Create a new moveable component and add it to the array
        const COLORS = ["red", "blue", "yellow", "green", "purple"];
        const FIT = ["cover", "contain"];

        const img = await getImgRandom();

        setMoveableComponents([
            ...moveableComponents,
            {
                id: Math.floor(Math.random() * Date.now()),
                top: 0,
                left: 0,
                width: 100,
                height: 100,
                img,
                fit: FIT[Math.floor(Math.random() * FIT.length)],
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                updateEnd: true
            },
        ]);
    };

    const updateMoveable = (id, newComponent, updateEnd = false) => {
        const updatedMoveables = moveableComponents.map((moveable, i) => {
            if (moveable.id === id) {
                return { id, ...newComponent, updateEnd };
            }
            return moveable;
        });
        setMoveableComponents(updatedMoveables);
    };

    const handleResizeStart = (index, e) => {
        // Check if the resize is coming from the left handle
        const [handlePosX, handlePosY] = e.direction;
        // 0 => center
        // -1 => top or left
        // 1 => bottom or right

        // -1, -1
        // -1, 0
        // -1, 1
        if (handlePosX === -1) {
            console.log("width", moveableComponents, e);
            // Save the initial left and width values of the moveable component
            const initialLeft = e.left;
            const initialWidth = e.width;

            // Set up the onResize event handler to update the left value based on the change in width
        }
    };

    const getImgRandom = async () => {
        try {
            const randomId = Math.floor(Math.random() * 4000)
            const response = await fetch (`https://jsonplaceholder.typicode.com/photos/${randomId}`);
            const data = await response.json();
            return data.url;
        } catch (err) {
            throw new Error(err);
        }
    }

    const handleDelete = (idComponent) => {
        const newMoveableComponents = moveableComponents.filter(component => component.id !== idComponent)
        setMoveableComponents(newMoveableComponents)
    }

    return (
        <main style={{ height: "100vh", width: "100vw", display: "grid" }}>
            <button style={{ width: "fit-content", }} onClick={addMoveable}>Add Moveable1</button>
            <div
                id="parent"
                style={{
                    position: "relative",
                    background: "black",
                    height: "80vh",
                    width: "80vw",
                }}
            >
                {moveableComponents.map((item, index) => (
                    <Component
                        {...item}
                        key={index}
                        updateMoveable={updateMoveable}
                        handleResizeStart={handleResizeStart}
                        setSelected={setSelected}
                        isSelected={selected === item.id}
                    />
                ))}
            </div>
            <div>
                <h2>Components</h2>

                {moveableComponents.map((item, index) => (
                    <div key={index} style={{ display: "flex", flexDirection: "row" }}>
                        <img src={item.img}  style={{ width: "10vw" }} alt="component"></img>
                        <button type="button" style={{ backgroundColor: "#ff6666", color: "#ffffff", border: "none", padding: ".3rem", margin: ".3rem", height: "2rem" }} onClick={() => handleDelete(item.id)}>DELETE</button>
                    </div>
                ))}
            </div>
        </main>
    );
};

export default App;

const Component = ({
    updateMoveable,
    top,
    left,
    width,
    height,
    index,
    img,
    fit,
    color,
    id,
    setSelected,
    isSelected = false,
    updateEnd,
}) => {
    const ref = useRef();

    const [nodoReferencia, setNodoReferencia] = useState({
        top,
        left,
        width,
        height,
        index,
        img,
        fit,
        color,
        id,
    });

    let parent = document.getElementById("parent");
    let parentBounds = parent?.getBoundingClientRect();

    const onDrag = (e) => {
        updateMoveable(id, {
            top: e.top,
            left: e.left,
            width,
            height,
            img,
            fit,
            color,
        });
    }

    const onResize = async (e) => {
        // ACTUALIZAR ALTO Y ANCHO
        let newWidth = e.width;
        let newHeight = e.height;

        const positionMaxTop = top + newHeight;
        const positionMaxLeft = left + newWidth;

        if (positionMaxTop > parentBounds?.height)
            newHeight = parentBounds?.height - top;
        if (positionMaxLeft > parentBounds?.width)
            newWidth = parentBounds?.width - left;

        updateMoveable(id, {
            top,
            left,
            width: newWidth,
            height: newHeight,
            img,
            fit,
            color,
        });

        // ACTUALIZAR NODO REFERENCIA
        const beforeTranslate = e.drag.beforeTranslate;

        ref.current.style.width = `${e.width}px`;
        ref.current.style.height = `${e.height}px`;

        let translateX = beforeTranslate[0];
        let translateY = beforeTranslate[1];

        ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;

        setNodoReferencia({
            ...nodoReferencia,
            translateX,
            translateY,
            top: top + translateY < 0 ? 0 : top + translateY,
            left: left + translateX < 0 ? 0 : left + translateX,
        });
    };

    const onResizeEnd = async (e) => {
        let newWidth = e.lastEvent?.width;
        let newHeight = e.lastEvent?.height;

        const positionMaxTop = top + newHeight;
        const positionMaxLeft = left + newWidth;

        if (positionMaxTop > parentBounds?.height) newHeight = parentBounds?.height - top;
        if (positionMaxLeft > parentBounds?.width) newWidth = parentBounds?.width - left;
        

        // const { lastEvent } = e;
        // const { drag } = lastEvent;
        // const { beforeTranslate } = drag;

        const absoluteTop = top; // top + beforeTranslate[1]; se sumaba extra la posicion absoluta del elemento
        const absoluteLeft = left; // left + beforeTranslate[0]; se sumaba extra la posicion absoluta del elemento

        updateMoveable(
            id,
            {
                top: absoluteTop,
                left: absoluteLeft,
                width: newWidth,
                height: newHeight,
                img,
                fit,
                color,
            },
            true
        );
    };

    return (
        <>
            <div
                ref={ref}
                className="draggable"
                id={"component-" + id}
                style={{
                    position: "absolute",
                    top: top,
                    left: left,
                    width: width,
                    height: height,
                    // background: color,
                    backgroundImage: `url(${img})`,
                    backgroundSize: fit
                    // backgroundRepeat: "no-repeat",
                }}
                onClick={() => setSelected(id)}
            />

            <Moveable
                target={isSelected && ref.current}
                resizable
                draggable
                onDrag={onDrag}
                onResize={onResize}
                onResizeEnd={onResizeEnd}
                keepRatio={false}
                throttleResize={1}
                renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
                edge={false}
                zoom={1}
                origin={false}
                padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
            />
        </>
    );
};
