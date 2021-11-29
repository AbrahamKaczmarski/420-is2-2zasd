import * as THREE from "three";

const buildTree = (scene, grammar, definitions, materials) => {
  let width = 1;
  let length = 10;

  let stack = [];
  let lastBranch;
  stack.push({ position: { x: 0, y: 0, z: 0 }, direction: 0, bend: 0 });

  for (const symbol of grammar) {
    const material = materials[symbol];
    switch (symbol) {
      case "O":
        scene.add(newSphere(lastBranch.endPoint, material));
        break;
      case "[":
        stack.push({
          position: lastBranch.endPoint,
          direction: lastBranch.direction,
          bend: lastBranch.bend,
        });
        break;
      case "]":
        stack.pop();
        break;
      default:
        const settings = definitions[symbol];
        if (settings) {
          lastBranch = newBranch(
            scene,
            stack[stack.length - 1].position,
            length,
            width,
            material,
            stack[stack.length - 1].direction + settings.direction,
            stack[stack.length - 1].bend + settings.bend
          );
        }
        break;
    }
  }
};

const newBranch = (
  scene,
  start = { x: 0, y: 0, z: 0 },
  length = 12,
  width = 1,
  material,
  direction = 0,
  bend = 0
) => {
  const branchModel = new THREE.CylinderGeometry(width, width, length, 100);
  const branch = new THREE.Mesh(branchModel, material);

  branch.translateX(start.x);
  branch.translateY(start.y);
  branch.translateZ(start.z);

  branch.rotateY(radians(direction));
  branch.rotateX(radians(bend));

  translateToAnchor(scene, branch, length);
  const ending = getPointFromElement(branch);
  translateToAnchor(scene, branch, -length / 2);
  const anchor = getPointFromElement(branch);

  return {
    anchor: anchor,
    endPoint: ending,
    direction: direction,
    bend: bend,
  };
};

const newSphere = (origin = { x: 0, y: 0, z: 0 }, material) => {
  const geometry = new THREE.SphereGeometry(2.0, 32, 16);
  const sphere = new THREE.Mesh(geometry, material);
  sphere.translateX(origin.x);
  sphere.translateY(origin.y);
  sphere.translateZ(origin.z);
  return sphere;
};

const translateToAnchor = (scene, element, length) => {
  element.translateY(length);
  scene.add(element);
  scene.updateMatrixWorld(true);
};

const getPointFromElement = (element) => {
  var end = new THREE.Vector3();
  end.setFromMatrixPosition(element.matrixWorld);
  return end;
};

const radians = (degrees) => {
  return (degrees * Math.PI) / 180;
};

export default buildTree;
