import { Router } from "express";

interface ControllerContract {
  path: string;
  router: Router;
}

export default ControllerContract;